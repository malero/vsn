import type { Disposer, Lifetime } from "./lifetime";

type ReactiveContainer = Record<PropertyKey, any> | any[];
type Listener = () => void;
type ListenerEntry = {
  handler: Listener;
  active: boolean;
};

export type ReactiveOptions = {
  lifetime?: Lifetime;
};

export type ComputedGetter<T> = (scope: Scope) => T;

export type EffectCallback = (scope: Scope) => void | Disposer;

export interface ComputedRef<T> {
  readonly value: T;
  get(): T;
  subscribe(listener: Listener): Disposer;
  dispose(): void;
}

const proxyToRaw = new WeakMap<object, object>();
const arrayMutators = new Set([
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift"
]);
let batchDepth = 0;
let flushing = false;
const pendingListeners = new Map<Listener, Set<ListenerEntry>>();
let currentFlushHandlers: Set<Listener> | undefined;
let processedFlushHandlers: Set<Listener> | undefined;

interface ComputedSource {
  subscribe(listener: Listener): Disposer;
}

interface ReactiveTrackingTarget {
  trackScopeRead(scope: Scope, path: string): void;
  trackComputed(source: ComputedSource): void;
}

const trackerStack: ReactiveTrackingTarget[] = [];

function trackScopeRead(scope: Scope, path: string): void {
  trackerStack[trackerStack.length - 1]?.trackScopeRead(scope, path);
}

function trackComputed(source: ComputedSource): void {
  trackerStack[trackerStack.length - 1]?.trackComputed(source);
}

function withTracker<T>(tracker: ReactiveTrackingTarget, callback: () => T): T {
  trackerStack.push(tracker);
  try {
    return callback();
  } finally {
    trackerStack.pop();
  }
}

function withoutTracking<T>(callback: () => T): T {
  const activeTrackers = trackerStack.splice(0);
  try {
    return callback();
  } finally {
    trackerStack.push(...activeTrackers);
  }
}

/**
 * Coalesces scope notifications until the synchronous callback completes.
 * Async callbacks are not held open across an await; wrap each synchronous
 * update phase separately when needed.
 */
export function batch<T>(callback: () => T): T {
  batchDepth += 1;
  let result: T;
  try {
    result = callback();
  } catch (error) {
    endBatch();
    throw error;
  }
  endBatch();
  return result;
}

function endBatch(): void {
  batchDepth -= 1;
  if (batchDepth === 0) {
    flushPendingListeners();
  }
}

function notifyListener(entry: ListenerEntry): void {
  if (!entry.active) {
    return;
  }
  if (batchDepth > 0 || flushing) {
    if (
      flushing
      && currentFlushHandlers?.has(entry.handler)
      && !processedFlushHandlers?.has(entry.handler)
    ) {
      return;
    }
    const entries = pendingListeners.get(entry.handler) ?? new Set<ListenerEntry>();
    entries.add(entry);
    pendingListeners.set(entry.handler, entries);
    return;
  }
  withoutTracking(entry.handler);
}

function flushPendingListeners(): void {
  if (flushing) {
    return;
  }
  flushing = true;
  let failed = false;
  let firstError: unknown;
  try {
    while (pendingListeners.size > 0) {
      const entries = Array.from(pendingListeners.entries());
      pendingListeners.clear();
      currentFlushHandlers = new Set(entries.map(([handler]) => handler));
      processedFlushHandlers = new Set<Listener>();
      for (const [handler, registrations] of entries) {
        if (!Array.from(registrations).some((entry) => entry.active)) {
          continue;
        }
        processedFlushHandlers.add(handler);
        try {
          withoutTracking(handler);
        } catch (error) {
          if (!failed) {
            failed = true;
            firstError = error;
          }
        }
      }
      currentFlushHandlers = undefined;
      processedFlushHandlers = undefined;
    }
  } finally {
    currentFlushHandlers = undefined;
    processedFlushHandlers = undefined;
    flushing = false;
  }
  if (failed) {
    throw firstError;
  }
}

abstract class ReactiveTracker implements ReactiveTrackingTarget {
  protected isDisposed = false;
  private scopeDependencies = new Map<Scope, Set<string>>();
  private computedDependencies = new Map<ComputedSource, Disposer>();
  private nextScopeDependencies = new Map<Scope, Set<string>>();
  private nextComputedDependencies = new Set<ComputedSource>();
  private tracking = false;
  protected readonly invalidateListener = () => this.invalidate();

  protected abstract invalidate(): void;

  protected collect<T>(callback: () => T): T {
    if (this.isDisposed) {
      return callback();
    }
    this.nextScopeDependencies = new Map<Scope, Set<string>>();
    this.nextComputedDependencies = new Set<ComputedSource>();
    this.tracking = true;
    try {
      return withTracker(this, callback);
    } finally {
      this.tracking = false;
      this.commitDependencies();
    }
  }

  trackScopeRead(scope: Scope, path: string): void {
    if (!this.tracking || this.isDisposed) {
      return;
    }
    const key = path.trim();
    if (!key) {
      return;
    }
    const paths = this.nextScopeDependencies.get(scope) ?? new Set<string>();
    paths.add(key);
    this.nextScopeDependencies.set(scope, paths);
  }

  trackComputed(source: ComputedSource): void {
    if (!this.tracking || this.isDisposed) {
      return;
    }
    this.nextComputedDependencies.add(source);
  }

  disposeTracking(): void {
    if (this.isDisposed) {
      return;
    }
    this.isDisposed = true;
    for (const [scope, paths] of this.scopeDependencies) {
      for (const path of paths) {
        scope.off(path, this.invalidateListener);
      }
    }
    this.scopeDependencies.clear();
    for (const remove of this.computedDependencies.values()) {
      remove();
    }
    this.computedDependencies.clear();
  }

  private commitDependencies(): void {
    if (this.isDisposed) {
      return;
    }
    for (const [scope, paths] of this.scopeDependencies) {
      for (const path of paths) {
        scope.off(path, this.invalidateListener);
      }
    }
    this.scopeDependencies = this.nextScopeDependencies;
    for (const [source, remove] of this.computedDependencies) {
      if (!this.nextComputedDependencies.has(source)) {
        remove();
      }
    }
    const nextComputedDependencies = new Map<ComputedSource, Disposer>();
    for (const source of this.nextComputedDependencies) {
      const existing = this.computedDependencies.get(source);
      if (existing) {
        nextComputedDependencies.set(source, existing);
      } else {
        nextComputedDependencies.set(source, source.subscribe(this.invalidateListener));
      }
    }
    this.computedDependencies = nextComputedDependencies;
    for (const [scope, paths] of this.scopeDependencies) {
      for (const path of paths) {
        scope.on(path, this.invalidateListener);
      }
    }
  }
}

class ComputedState<T> extends ReactiveTracker implements ComputedRef<T>, ComputedSource {
  private currentValue!: T;
  private dirty = true;
  private evaluating = false;
  private subscribers = new Set<ListenerEntry>();
  private removeLifetime: Disposer | undefined;

  constructor(
    private readonly scope: Scope,
    private readonly getter: ComputedGetter<T>,
    lifetime?: Lifetime,
    private readonly onDispose?: () => void
  ) {
    super();
    if (lifetime) {
      this.removeLifetime = lifetime.onCleanup(() => this.dispose());
    }
  }

  get value(): T {
    return this.get();
  }

  get(): T {
    trackComputed(this);
    if (this.isDisposed) {
      return this.currentValue;
    }
    if (this.dirty) {
      this.recompute();
    }
    return this.currentValue;
  }

  subscribe(listener: Listener): Disposer {
    if (typeof listener !== "function") {
      throw new TypeError("Computed subscribers must be functions");
    }
    if (this.isDisposed) {
      return () => undefined;
    }
    const entry: ListenerEntry = { handler: listener, active: true };
    const existing = Array.from(this.subscribers).find(
      (candidate) => candidate.active && candidate.handler === listener
    );
    if (existing) {
      return () => undefined;
    }
    this.subscribers.add(entry);
    try {
      this.get();
    } catch (error) {
      entry.active = false;
      this.subscribers.delete(entry);
      throw error;
    }
    return () => {
      if (!entry.active) {
        return;
      }
      entry.active = false;
      this.subscribers.delete(entry);
    };
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.removeLifetime?.();
    this.removeLifetime = undefined;
    this.disposeTracking();
    for (const entry of this.subscribers) {
      entry.active = false;
    }
    this.subscribers.clear();
    this.onDispose?.();
  }

  protected invalidate(): void {
    if (this.isDisposed || this.dirty) {
      return;
    }
    this.dirty = true;
    if (this.subscribers.size === 0) {
      return;
    }
    const previousValue = this.currentValue;
    const nextValue = this.recompute();
    if (!Object.is(previousValue, nextValue)) {
      for (const entry of this.subscribers) {
        notifyListener(entry);
      }
    }
  }

  private recompute(): T {
    if (this.evaluating) {
      throw new Error("Computed state cannot depend on itself");
    }
    this.evaluating = true;
    try {
      const nextValue = this.collect(() => this.getter(this.scope));
      this.currentValue = nextValue;
      this.dirty = false;
      return nextValue;
    } catch (error) {
      this.dirty = true;
      throw error;
    } finally {
      this.evaluating = false;
    }
  }
}

class ReactiveEffect extends ReactiveTracker {
  private running = false;
  private rerunRequested = false;
  private cleanup: Disposer | undefined;
  private removeLifetime: Disposer | undefined;

  constructor(
    private readonly scope: Scope,
    private readonly callback: EffectCallback,
    lifetime?: Lifetime
  ) {
    super();
    if (lifetime) {
      this.removeLifetime = lifetime.onCleanup(() => this.dispose());
    }
    try {
      this.run();
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.removeLifetime?.();
    this.removeLifetime = undefined;
    this.disposeTracking();
    const cleanup = this.cleanup;
    this.cleanup = undefined;
    cleanup?.();
  }

  protected invalidate(): void {
    if (this.isDisposed) {
      return;
    }
    if (this.running) {
      this.rerunRequested = true;
      return;
    }
    this.run();
  }

  private run(): void {
    if (this.isDisposed || this.running) {
      this.rerunRequested = true;
      return;
    }
    do {
      this.rerunRequested = false;
      this.running = true;
      const cleanup = this.cleanup;
      this.cleanup = undefined;
      try {
        cleanup?.();
        const nextCleanup = this.collect(() => this.callback(this.scope));
        if (typeof nextCleanup === "function") {
          this.cleanup = nextCleanup;
        }
      } finally {
        this.running = false;
      }
    } while (this.rerunRequested && !this.isDisposed);
  }
}

function isReactiveContainer(value: unknown): value is ReactiveContainer {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function unwrapProxy(value: any): any {
  let current = value;
  let raw = current && typeof current === "object" ? proxyToRaw.get(current) : undefined;
  while (raw && raw !== current) {
    current = raw;
    raw = current && typeof current === "object" ? proxyToRaw.get(current) : undefined;
  }
  return current;
}

export class Scope {
  private data = new Map<string, any>();
  private computedValues = new Map<string, ComputedState<any>>();
  private root: Scope;
  private listeners = new Map<string, Set<ListenerEntry>>();
  private anyListeners = new Set<ListenerEntry>();
  private reactiveProxies = new WeakMap<object, Map<string, object>>();
  public isEachItem = false;

  constructor(public parent?: Scope) {
    this.root = parent ? parent.root : this;
  }

  createChild(): Scope {
    return new Scope(this);
  }

  setParent(parent: Scope): void {
    if (this.parent) {
      return;
    }
    this.parent = parent;
    this.root = parent.root;
  }

  get(key: string): any {
    return this.getPath(key);
  }

  set(key: string, value: any): void {
    this.setPath(key, value);
  }

  batch<T>(callback: () => T): T {
    return batch(callback);
  }

  computed<T>(getter: ComputedGetter<T>, options?: ReactiveOptions): ComputedRef<T>;
  computed<T>(name: string, getter: ComputedGetter<T>, options?: ReactiveOptions): ComputedRef<T>;
  computed<T>(
    nameOrGetter: string | ComputedGetter<T>,
    getterOrOptions?: ComputedGetter<T> | ReactiveOptions,
    options?: ReactiveOptions
  ): ComputedRef<T> {
    if (typeof nameOrGetter === "function") {
      return computed(this, nameOrGetter, getterOrOptions as ReactiveOptions | undefined);
    }

    const name = nameOrGetter.trim();
    const getter = getterOrOptions as ComputedGetter<T> | undefined;
    if (!name || name.includes(".")) {
      throw new Error("Named computed state requires a non-empty root key");
    }
    if (typeof getter !== "function") {
      throw new TypeError("Computed state requires a getter function");
    }
    if (this.data.has(name) || this.computedValues.has(name)) {
      throw new Error(`Cannot define computed state '${name}' more than once`);
    }

    const state = new ComputedState(
      this,
      getter,
      options?.lifetime,
      () => {
        if (this.computedValues.get(name) === state) {
          this.computedValues.delete(name);
          this.emitChange(name);
        }
      }
    );
    this.computedValues.set(name, state);
    try {
      state.subscribe(() => this.emitChange(name));
    } catch (error) {
      state.dispose();
      throw error;
    }
    this.emitChange(name);
    return state;
  }

  effect(callback: EffectCallback, options?: ReactiveOptions): Disposer {
    return effect(this, callback, options);
  }

  hasKey(path: string): boolean {
    const parts = path.split(".");
    const root = parts[0];
    if (!root) {
      return false;
    }
    return this.data.has(root) || this.computedValues.has(root);
  }

  getPath(path: string): any {
    const explicit = path.startsWith("parent.") || path.startsWith("root.") || path.startsWith("self.");
    const { targetScope, targetPath } = this.resolveScope(path);
    if (!targetScope || !targetPath) {
      return undefined;
    }

    const localValue = this.getLocalPathValue(targetScope, targetPath);
    if (explicit || targetScope.hasKey(targetPath)) {
      if (!targetScope.computedValues.has(targetPath.split(".")[0] ?? "")) {
        trackScopeRead(targetScope, targetPath);
      }
      return targetScope.wrapValue(localValue, targetPath);
    }
    const lookupScopes = [targetScope];
    let cursor = targetScope.parent;
    while (cursor) {
      lookupScopes.push(cursor);
      const value = this.getLocalPathValue(cursor, targetPath);
      if (cursor.hasKey(targetPath)) {
        if (!cursor.computedValues.has(targetPath.split(".")[0] ?? "")) {
          trackScopeRead(cursor, targetPath);
        }
        return cursor.wrapValue(value, targetPath);
      }
      cursor = cursor.parent;
    }
    lookupScopes.forEach((scope) => trackScopeRead(scope, targetPath));
    return undefined;
  }

  setPath(path: string, value: any): void {
    const explicit = path.startsWith("parent.") || path.startsWith("root.") || path.startsWith("self.");
    const { targetScope, targetPath } = this.resolveScope(path);
    if (!targetScope || !targetPath) {
      return;
    }

    const scopeForSet = explicit ? targetScope : this.findNearestScopeWithKey(targetScope, targetPath) ?? targetScope;
    const parts = targetPath.split(".");
    const root = parts[0];
    if (!root) {
      return;
    }
    const nextValue = unwrapProxy(value);
    if (parts.length === 1) {
      if (scopeForSet.computedValues.has(root)) {
        throw new Error(`Cannot assign to computed state '${root}'`);
      }
      scopeForSet.data.set(root, nextValue);
      scopeForSet.emitChange(targetPath);
      return;
    }
    if (scopeForSet.computedValues.has(root)) {
      throw new Error(`Cannot assign to computed state '${root}'`);
    }
    let obj = unwrapProxy(scopeForSet.data.get(root));
    if (obj == null || typeof obj !== "object") {
      obj = {};
      scopeForSet.data.set(root, obj);
    }
    let cursor = obj;
    for (let i = 1; i < parts.length - 1; i += 1) {
      const key = parts[i];
      if (!key) {
        return;
      }
      const current = unwrapProxy(cursor[key]);
      if (current == null || typeof current !== "object") {
        cursor[key] = {};
      } else if (current !== cursor[key]) {
        cursor[key] = current;
      }
      cursor = cursor[key];
    }
    const lastKey = parts[parts.length - 1];
    if (!lastKey) {
      return;
    }
    cursor[lastKey] = nextValue;
    scopeForSet.emitChange(targetPath);
  }

  on(path: string, handler: () => void): void {
    const key = path.trim();
    if (!key) {
      return;
    }
    const set = this.listeners.get(key) ?? new Set<ListenerEntry>();
    if (!Array.from(set).some((entry) => entry.active && entry.handler === handler)) {
      set.add({ handler, active: true });
    }
    this.listeners.set(key, set);
  }

  off(path: string, handler: () => void): void {
    const key = path.trim();
    const set = this.listeners.get(key);
    if (!set) {
      return;
    }
    for (const entry of set) {
      if (entry.handler === handler) {
        entry.active = false;
        set.delete(entry);
      }
    }
    if (set.size === 0) {
      this.listeners.delete(key);
    }
  }

  onAny(handler: () => void): void {
    if (!Array.from(this.anyListeners).some((entry) => entry.active && entry.handler === handler)) {
      this.anyListeners.add({ handler, active: true });
    }
  }

  offAny(handler: () => void): void {
    for (const entry of this.anyListeners) {
      if (entry.handler === handler) {
        entry.active = false;
        this.anyListeners.delete(entry);
      }
    }
  }

  private emitChange(path: string): void {
    const key = path.trim();
    if (!key) {
      return;
    }

    const handlers = new Set<ListenerEntry>();
    for (const [watchedPath, listeners] of this.listeners.entries()) {
      if (
        watchedPath === key
        || watchedPath.startsWith(`${key}.`)
        || key.startsWith(`${watchedPath}.`)
      ) {
        listeners.forEach((handler) => handlers.add(handler));
      }
    }
    batch(() => {
      handlers.forEach((entry) => notifyListener(entry));
      this.anyListeners.forEach((entry) => notifyListener(entry));
    });
  }

  private resolveScope(path: string): { targetScope: Scope | undefined; targetPath: string | undefined } {
    let targetScope: Scope | undefined = this;
    let targetPath = path;
    while (targetPath.startsWith("parent.")) {
      targetScope = targetScope?.parent;
      targetPath = targetPath.slice("parent.".length);
    }
    if (targetPath.startsWith("root.")) {
      targetScope = targetScope?.root;
      targetPath = targetPath.slice("root.".length);
    }
    while (targetPath.startsWith("self.")) {
      targetScope = targetScope ?? this;
      targetPath = targetPath.slice("self.".length);
    }
    return { targetScope, targetPath };
  }

  private getLocalPathValue(scope: Scope, path: string): any {
    const parts = path.split(".");
    const root = parts[0];
    if (!root) {
      return undefined;
    }
    const computed = scope.computedValues.get(root);
    let value = computed ? computed.get() : scope.data.get(root);
    for (let i = 1; i < parts.length; i += 1) {
      if (value == null) {
        return undefined;
      }
      const key = parts[i];
      if (!key) {
        return undefined;
      }
      value = unwrapProxy(value)[key];
    }
    return unwrapProxy(value);
  }

  private findNearestScopeWithKey(start: Scope, path: string): Scope | undefined {
    const root = path.split(".")[0];
    if (!root) {
      return undefined;
    }
    let cursor: Scope | undefined = start;
    while (cursor) {
      if (cursor.data.has(root)) {
        return cursor;
      }
      cursor = cursor.parent;
    }
    return undefined;
  }

  private wrapValue<T>(value: T, path: string): T {
    const rawValue = unwrapProxy(value);
    if (!isReactiveContainer(rawValue)) {
      return value;
    }
    const existing = this.reactiveProxies.get(rawValue);
    const cached = existing?.get(path);
    if (cached) {
      return cached as T;
    }

    const scope = this;
    const proxy = new Proxy(rawValue, {
      get(target, property, receiver) {
        if (Array.isArray(target) && property === Symbol.iterator) {
          return function* iterator() {
            trackScopeRead(scope, scope.appendPath(path, "length"));
            for (let index = 0; index < target.length; index += 1) {
              const itemPath = scope.appendPath(path, String(index));
              trackScopeRead(scope, itemPath);
              yield scope.wrapValue(target[index], itemPath);
            }
          };
        }
        const nextValue = Reflect.get(target, property, receiver);
        if (Array.isArray(target) && typeof property === "string" && arrayMutators.has(property)) {
          if (typeof nextValue !== "function") {
            return nextValue;
          }
          return (...args: any[]) => batch(() => Reflect.apply(nextValue, receiver, args));
        }
        if (typeof property !== "string") {
          return nextValue;
        }
        const propertyPath = scope.appendPath(path, property);
        trackScopeRead(scope, propertyPath);
        return scope.wrapValue(nextValue, propertyPath);
      },
      set(target, property, nextValue) {
        const rawNextValue = unwrapProxy(nextValue);
        const previousValue = Reflect.get(target, property, target);
        const previousLength = Array.isArray(target) ? target.length : undefined;
        const success = Reflect.set(target, property, rawNextValue, target);
        if (!success) {
          return false;
        }
        if (!Object.is(previousValue, rawNextValue)) {
          const propertyPath = typeof property === "string"
            ? scope.appendPath(path, property)
            : path;
          scope.emitChange(propertyPath);
          if (Array.isArray(target) && previousLength !== target.length) {
            scope.emitChange(scope.appendPath(path, "length"));
          }
        }
        return true;
      },
      deleteProperty(target, property) {
        const existed = Reflect.has(target, property);
        const success = Reflect.deleteProperty(target, property);
        if (success && existed) {
          const propertyPath = typeof property === "string"
            ? scope.appendPath(path, property)
            : path;
          scope.emitChange(propertyPath);
        }
        return success;
      },
      defineProperty(target, property, descriptor) {
        const previousLength = Array.isArray(target) ? target.length : undefined;
        const nextDescriptor = { ...descriptor };
        if ("value" in nextDescriptor) {
          nextDescriptor.value = unwrapProxy(nextDescriptor.value);
        }
        const success = Reflect.defineProperty(target, property, nextDescriptor);
        if (success) {
          const propertyPath = typeof property === "string"
            ? scope.appendPath(path, property)
            : path;
          scope.emitChange(propertyPath);
          if (Array.isArray(target) && previousLength !== target.length) {
            scope.emitChange(scope.appendPath(path, "length"));
          }
        }
        return success;
      }
    });
    proxyToRaw.set(proxy, rawValue);
    const cache = existing ?? new Map<string, object>();
    cache.set(path, proxy);
    this.reactiveProxies.set(rawValue, cache);
    return proxy as T;
  }

  private appendPath(path: string, property: string): string {
    if (!property) {
      return path;
    }
    return path ? `${path}.${property}` : property;
  }
}

export function computed<T>(
  scope: Scope,
  getter: ComputedGetter<T>,
  options?: ReactiveOptions
): ComputedRef<T> {
  if (!(scope instanceof Scope)) {
    throw new TypeError("Computed state requires a Scope");
  }
  if (typeof getter !== "function") {
    throw new TypeError("Computed state requires a getter function");
  }
  return new ComputedState(scope, getter, options?.lifetime);
}

export function effect(
  scope: Scope,
  callback: EffectCallback,
  options?: ReactiveOptions
): Disposer {
  if (!(scope instanceof Scope)) {
    throw new TypeError("Effects require a Scope");
  }
  if (typeof callback !== "function") {
    throw new TypeError("Effects require a callback function");
  }
  const reactiveEffect = new ReactiveEffect(scope, callback, options?.lifetime);
  return () => reactiveEffect.dispose();
}
