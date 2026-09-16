type ReactiveContainer = Record<PropertyKey, any> | any[];
type Listener = () => void;
type ListenerEntry = {
  handler: Listener;
  active: boolean;
};

const proxyToRaw = new WeakMap<object, object>();
let batchDepth = 0;
let flushing = false;
const pendingListeners = new Map<Listener, Set<ListenerEntry>>();

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
    const entries = pendingListeners.get(entry.handler) ?? new Set<ListenerEntry>();
    entries.add(entry);
    pendingListeners.set(entry.handler, entries);
    return;
  }
  entry.handler();
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
      for (const [handler, registrations] of entries) {
        if (!Array.from(registrations).some((entry) => entry.active)) {
          continue;
        }
        try {
          handler();
        } catch (error) {
          if (!failed) {
            failed = true;
            firstError = error;
          }
        }
      }
    }
  } finally {
    flushing = false;
  }
  if (failed) {
    throw firstError;
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

  hasKey(path: string): boolean {
    const parts = path.split(".");
    const root = parts[0];
    if (!root) {
      return false;
    }
    return this.data.has(root);
  }

  getPath(path: string): any {
    const explicit = path.startsWith("parent.") || path.startsWith("root.") || path.startsWith("self.");
    const { targetScope, targetPath } = this.resolveScope(path);
    if (!targetScope || !targetPath) {
      return undefined;
    }

    const localValue = this.getLocalPathValue(targetScope, targetPath);
    if (explicit || targetScope.hasKey(targetPath)) {
      return targetScope.wrapValue(localValue, targetPath);
    }
    let cursor = targetScope.parent;
    while (cursor) {
      const value = this.getLocalPathValue(cursor, targetPath);
      if (cursor.hasKey(targetPath)) {
        return cursor.wrapValue(value, targetPath);
      }
      cursor = cursor.parent;
    }
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
      scopeForSet.data.set(root, nextValue);
      scopeForSet.emitChange(targetPath);
      return;
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
    handlers.forEach((entry) => notifyListener(entry));
    this.anyListeners.forEach((entry) => notifyListener(entry));
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
    let value = scope.data.get(root);
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
            for (let index = 0; index < target.length; index += 1) {
              yield scope.wrapValue(target[index], scope.appendPath(path, String(index)));
            }
          };
        }
        const nextValue = Reflect.get(target, property, receiver);
        if (typeof property !== "string") {
          return nextValue;
        }
        return scope.wrapValue(nextValue, scope.appendPath(path, property));
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
