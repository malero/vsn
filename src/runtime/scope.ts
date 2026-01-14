export class Scope {
  private data = new Map<string, any>();
  private root: Scope;
  private listeners = new Map<string, Set<() => void>>();

  constructor(public readonly parent?: Scope) {
    this.root = parent ? parent.root : this;
  }

  get(key: string): any {
    return this.getPath(key);
  }

  set(key: string, value: any): void {
    this.setPath(key, value);
  }

  getPath(path: string): any {
    const { targetScope, targetPath } = this.resolveScope(path);
    if (!targetScope || !targetPath) {
      return undefined;
    }

    const parts = targetPath.split(".");
    const root = parts[0];
    if (!root) {
      return undefined;
    }
    let value = targetScope.data.get(root);
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

  setPath(path: string, value: any): void {
    const { targetScope, targetPath } = this.resolveScope(path);
    if (!targetScope || !targetPath) {
      return;
    }

    const parts = targetPath.split(".");
    const root = parts[0];
    if (!root) {
      return;
    }
    if (parts.length === 1) {
      targetScope.data.set(root, value);
      targetScope.emitChange(targetPath);
      return;
    }
    let obj = targetScope.data.get(root);
    if (obj == null || typeof obj !== "object") {
      obj = {};
      targetScope.data.set(root, obj);
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
    this.emitChange(path);
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
  }

  private resolveScope(path: string): { targetScope: Scope | undefined; targetPath: string | undefined } {
    if (path.startsWith("parent.")) {
      return { targetScope: this.parent, targetPath: path.slice("parent.".length) };
    }
    if (path.startsWith("root.")) {
      return { targetScope: this.root, targetPath: path.slice("root.".length) };
    }
    if (path.startsWith("self.")) {
      return { targetScope: this, targetPath: path.slice("self.".length) };
    }
    return { targetScope: this, targetPath: path };
  }
}
