import {VisionHelper} from "./helpers/VisionHelper";

export interface IBenchmark {
    name: string;
    tags: string[];
    path: string;
    time: number;
}

export type TTag = string[] | string;
export const BENCHMARKS: IBenchmark[] = [];
const BENCHMARK_STARTS: { [key: string]: Date } = {};

function totags(tags: TTag): string[] {
    tags = tags instanceof Array ? tags : tags && [tags] || [];
    return tags.map((tag) => tag.toLowerCase());
}

function topath(name, tags) {
    tags = [...totags(tags)];
    tags.sort();
    return tags.length && `${name}.${tags.join('.')}`.toLowerCase() || name && name.toLowerCase() || 'nopath';
}

function todata(name, tags: TTag, timeOrStart, end = null): IBenchmark {
    if (end instanceof Date || Number.isFinite(end)) {
        if (!Number.isFinite(timeOrStart) && timeOrStart instanceof Date)
            timeOrStart = timeOrStart.getTime();

        if (!Number.isFinite(end) && end instanceof Date)
            end = end.getTime();

        timeOrStart = end - timeOrStart;
    }
    tags = totags(tags);

    return {
        name: name,
        tags: tags,
        path: topath(name, tags),
        time: timeOrStart
    }
}

function hasTags(fullList: TTag, toMatch: TTag): boolean {
    fullList = totags(fullList);
    toMatch = totags(toMatch);
    for (const tag in toMatch) {
        if (fullList.indexOf(tag) === -1)
            return false;
    }

    return true;
}

export function benchmark(name?: string, tags?: TTag, print: boolean = false) {
    return function (target: any, key?: string, descriptor?: PropertyDescriptor): void {
        if (VisionHelper.doBenchmark) {
            const method: (...args: any[]) => any = descriptor.value;

            descriptor.value = function (...args): any {
                name = target.__BENCHMARK_NAME__ || name || key;
                tags = totags(tags);
                if (target.__BENCHMARK_NAME__ || target.__BENCHMARK_TAGS__) {
                    tags.push(name || key);
                    tags.push(...target.__BENCHMARK_TAGS__);
                }
                const start: Date = new Date();
                const result = method.apply(this, args);
                const end: Date = new Date();
                const data = todata(name, tags, start, end);
                BENCHMARKS.push(data);

                if (print)
                    console.log(data);

                return result;
            };
        }
    };
}

export function benchmarkStart(name: string, tags?: TTag) {
    if (VisionHelper.doBenchmark) {
        name = topath(name, tags);
        BENCHMARK_STARTS[name] = new Date();
    }
}

export function benchmarkEnd(name: string, tags?: TTag, print: boolean = null) {
    if (VisionHelper.doBenchmark) {
        const path = topath(name, tags);
        const start: Date = BENCHMARK_STARTS[path];
        const end: Date = new Date();
        const data = todata(name, tags, start, end);
        BENCHMARKS.push(data);
        if (print || (print === null && data.time > 10)) {
            const debugName = data.path ? `${name}[${data.path}]` : name;
            console.warn(`${debugName} took ${data.time}ms to complete.`);
        }
        // Benchmark chaining
        benchmarkStart(name);
        return data;
    }
}

export function benchmarkResults(name: string | null, tags: TTag = null): any {
    if (VisionHelper.doBenchmark) {
        const path = topath(name, tags);
        let calls: number = 0;
        let time: number = 0;
        for (const bm of BENCHMARKS)
            if ((!tags && bm.name === name) || bm.path === path || !name && hasTags(bm.tags, tags)) {
                calls++;
                time += bm.time;
            }

        return {
            name: name,
            calls: calls,
            time: time,
            average: time / calls
        };
    }
}

export function benchmarkResultsMatch(regexp: RegExp): any {
    if (VisionHelper.doBenchmark) {
        const data: any = {};
        let calls: number = 0;
        let time: number = 0;
        for (const bm of BENCHMARKS) {
            if (regexp.test(bm.name) && !data[bm.name]) {
                data[bm.name] = benchmarkResults(bm.name);
                calls += data[bm.name].calls;
                time += data[bm.name].time;
            }
        }

        data['ALL'] = {
            name: 'ALL',
            calls: calls,
            time: time,
            average: time / calls
        };

        return data;
    }
}

export function benchmarkResultsAll(): any {
    if (VisionHelper.doBenchmark) {
        const data: any = {};
        let calls: number = 0;
        let time: number = 0;
        for (const bm of BENCHMARKS) {
            if (!data[bm.name]) {
                const name = bm.path ? `${bm.name}.${bm.path}` : bm.name;
                data[name] = benchmarkResults(bm.name, bm.tags);
                calls += data[name].calls;
                time += data[name].time;
            }
        }

        data['ALL'] = {
            name: 'ALL',
            calls: calls,
            time: time,
            average: time / calls
        };

        return data;
    }
}

if (VisionHelper.doBenchmark && VisionHelper.window) {
    window['benchmark'] = benchmark;
    window['benchmarks'] = BENCHMARKS;
    window['benchmarkStart'] = benchmarkStart;
    window['benchmarkEnd'] = benchmarkEnd;
    window['benchmarkResults'] = benchmarkResults;
    window['benchmarkResultsMatch'] = benchmarkResultsMatch;
    window['benchmarkResultsAll'] = benchmarkResultsAll;
}
