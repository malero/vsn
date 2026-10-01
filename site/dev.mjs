// Foreground Go preview runner. Uses only Node built-ins and the Go toolchain.
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtempSync, readdirSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const watch = !args.includes('--no-watch');
const serverArgs = args.filter(arg => arg !== '--no-watch');
if (!serverArgs.some(arg => arg === '-addr' || arg.startsWith('-addr='))) {
  serverArgs.unshift('-addr', '127.0.0.1:8080');
}
const temporary = mkdtempSync(join(tmpdir(), 'vsn-site-'));
const windows = process.platform === 'win32';
let compiler;
let server;
let stopping = false;
let building = false;
let revision = 0;
let attempted = -1;
let poll;
let debounce;

function launch(command, arguments_, extraEnv = {}) {
  const child = spawn(command, arguments_, {
    cwd: root,
    env: {...process.env, ...extraEnv},
    stdio: ['ignore', 'inherit', 'inherit'],
    detached: !windows,
  });
  const job = {child, finished: false, expectedStop: false};
  job.done = new Promise(resolve => {
    child.once('error', error => {
      job.finished = true;
      resolve({code: 1, error});
    });
    child.once('close', (code, signal) => {
      job.finished = true;
      resolve({code, signal});
    });
  });
  return job;
}

function signalGroup(job, signal) {
  if (!job.child.pid) return;
  try {
    process.kill(-job.child.pid, signal);
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}

async function stop(job) {
  if (!job || job.finished) return;
  if (!job.child.pid) {await job.done; return;}
  job.expectedStop = true;
  if (windows) {
    // Windows has no POSIX process groups; use its built-in tree termination.
    const killer = spawn('taskkill', ['/pid', String(job.child.pid), '/T', '/F'], {stdio: 'ignore'});
    await new Promise(resolve => {
      killer.once('error', () => {job.child.kill(); resolve();});
      killer.once('close', resolve);
    });
    await job.done;
    return;
  }
  signalGroup(job, 'SIGTERM');
  let timer;
  await Promise.race([
    job.done,
    new Promise(resolve => {timer = setTimeout(resolve, 1500);}),
  ]);
  clearTimeout(timer);
  // Also remove compiler descendants if their parent exited first.
  signalGroup(job, 'SIGKILL');
  await job.done;
}

async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  clearInterval(poll);
  clearTimeout(debounce);
  process.stdin.pause();
  try {
    await Promise.all([stop(compiler), stop(server)]);
  } finally {
    rmSync(temporary, {recursive: true, force: true});
    console.log('[site] Stopped; child processes and temporary builds cleaned up.');
    process.exit(code);
  }
}

async function rebuild() {
  if (building || stopping) return;
  building = true;
  try {
    while (!stopping && attempted !== revision) {
      const current = revision;
      const binary = join(temporary, `site-${current}${windows ? '.exe' : ''}`);
      console.log('[site] Building Go preview…');
      compiler = launch('go', ['build', '-o', binary, './site'], {GOTMPDIR: temporary});
      const result = await compiler.done;
      compiler = undefined;
      if (stopping) return;
      if (current !== revision) {
        rmSync(binary, {force: true});
        continue;
      }
      attempted = current;
      if (result.error) console.error(`[site] ${result.error.message}`);
      if (result.code !== 0) {
        rmSync(binary, {force: true});
        console.error(`[site] Build failed.${server ? ' Keeping the last successful server running.' : ''} ${watch ? 'Save a watched file or type rs to retry.' : ''}`);
        if (!watch) await shutdown(1);
        continue;
      }
      const previous = server;
      await stop(previous);
      if (previous?.binary) rmSync(previous.binary, {force: true});
      if (stopping) return;
      if (current !== revision) {
        rmSync(binary, {force: true});
        continue;
      }
      const next = launch(binary, serverArgs);
      next.binary = binary;
      server = next;
      console.log(`[site] Preview started (PID ${next.child.pid}).${watch ? ' Watching Go, templates, content, assets, and Go modules; refresh the browser after saves.' : ''}`);
      void next.done.then(result => {
        if (server === next) server = undefined;
        if (stopping || next.expectedStop) return;
        if (result.error) console.error(`[site] ${result.error.message}`);
        console.error(`[site] Server exited (${result.code ?? result.signal}).${watch ? ' Check the error above; save a watched file or type rs to retry.' : ''}`);
        if (!watch) void shutdown(result.code ?? 1);
      });
    }
  } finally {
    building = false;
  }
}

function snapshot() {
  const files = ['go.mod', 'go.sum'];
  function collect(directory) {
    let entries;
    try {entries = readdirSync(directory, {withFileTypes: true});}
    catch (error) {if (error.code === "ENOENT") return; throw error;}
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) collect(path);
      else if (entry.isFile()) {
        const name = relative(root, path).split('\\').join('/');
        if (name.endsWith('.go') || name.endsWith('.html') || name.startsWith('site/content/') || name.startsWith('site/assets/')) files.push(name);
      }
    }
  }
  collect(join(root, 'site'));
  const hash = createHash('sha256');
  for (const name of files.sort()) {
    try {
      hash.update(name).update('\0').update(readFileSync(join(root, name))).update('\0');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return hash.digest('hex');
}

function requestRestart() {
  revision++;
  clearTimeout(debounce);
  debounce = setTimeout(() => void rebuild().catch(fatal), 200);
}

function fatal(error) {
  console.error('[site]', error);
  void shutdown(1);
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => void shutdown(signal === 'SIGINT' ? 130 : 0));
}
process.on('uncaughtException', fatal);
process.on('unhandledRejection', fatal);

if (watch) {
  let previous = snapshot();
  // Content polling works across macOS, Linux, and Windows, including atomic saves.
  poll = setInterval(() => {
    try {
      const next = snapshot();
      if (next !== previous) {
        previous = next;
        console.log('[site] Source changed; scheduling rebuild.');
        requestRestart();
      }
    } catch (error) {fatal(error);}
  }, 250);
  if (process.stdin.isTTY) {
    console.log('[site] Ctrl+C stops the preview; rs + Enter rebuilds manually.');
    process.stdin.setEncoding('utf8');
    let input = '';
    process.stdin.on('data', chunk => {
      input += chunk;
      let newline;
      while ((newline = input.indexOf('\n')) !== -1) {
        if (input.slice(0, newline).trim() === 'rs') requestRestart();
        input = input.slice(newline + 1);
      }
    });
  }
}
void rebuild().catch(fatal);
