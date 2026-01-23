export class Scope {
  private data = new Map<string, any>();
  private root: Scope;
  private listeners = new Map<string, Set<() => void>>();
  private anyListeners = new Set<() => void>();
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
    if (explicit || localValue !== undefined) {
      return localValue;
    }
    let cursor = targetScope.parent;
    while (cursor) {
      const value = this.getLocalPathValue(cursor, targetPath);
      if (value !== undefined) {
        return value;
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
    if (parts.length === 1) {
      scopeForSet.data.set(root, value);
      scopeForSet.emitChange(targetPath);
      return;
    }
    let obj = scopeForSet.data.get(root);
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
      if (cursor[key] == null || typeof cursor[key] !== "object") {
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
    const lastKey = parts[parts.length - 1];
    if (!lastKey) {
      return;
    }
    cursor[lastKey] = value;
    scopeForSet.emitChange(targetPath);
  }

  on(path: string, handler: () => void): void {
    const key = path.trim();
    if (!key) {
      return;
    }
    const set = this.listeners.get(key) ?? new Set<() => void>();
    set.add(handler);
    this.listeners.set(key, set);
  }

  off(path: string, handler: () => void): void {
    const key = path.trim();
    const set = this.listeners.get(key);
    if (!set) {
      return;
    }
    set.delete(handler);
    if (set.size === 0) {
      this.listeners.delete(key);
    }
  }

  onAny(handler: () => void): void {
    this.anyListeners.add(handler);
  }

  offAny(handler: () => void): void {
    this.anyListeners.delete(handler);
  }

  private emitChange(path: string): void {
    const key = path.trim();
    if (!key) {
      return;
    }
    this.listeners.get(key)?.forEach((fn) => fn());
    const rootKey = key.split(".")[0];
    if (rootKey && rootKey !== key) {
      this.listeners.get(rootKey)?.forEach((fn) => fn());
    }
    this.anyListeners.forEach((fn) => fn());
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
      value = value[key];
    }
    return value;
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
}
