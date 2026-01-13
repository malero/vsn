export class Scope {
  private data = new Map<string, any>();

  get(key: string): any {
    return this.getPath(key);
  }

  set(key: string, value: any): void {
    this.setPath(key, value);
  }

  getPath(path: string): any {
    const parts = path.split(".");
    const root = parts[0];
    if (!root) {
      return undefined;
    }
    let value = this.data.get(root);
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
    const parts = path.split(".");
    const root = parts[0];
    if (!root) {
      return;
    }
    if (parts.length === 1) {
      this.data.set(root, value);
      return;
    }
    let obj = this.data.get(root);
    if (obj == null || typeof obj !== "object") {
      obj = {};
      this.data.set(root, obj);
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
  }
}
