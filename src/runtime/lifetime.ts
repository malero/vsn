export type Disposer = () => void;

type CleanupEntry = {
  disposer: Disposer;
  active: boolean;
};

/**
 * Owns resources for one mounted element or behavior binding.
 *
 * Disposers run once, in reverse registration order. Registering after the
 * lifetime has been disposed runs the disposer immediately, which makes it
 * safe for asynchronous setup to finish after an element has been removed.
 */
export class Lifetime {
  private entries = new Set<CleanupEntry>();
  private disposed = false;

  get isDisposed(): boolean {
    return this.disposed;
  }

  add(disposer: Disposer): Disposer {
    if (typeof disposer !== "function") {
      throw new TypeError("Lifetime disposers must be functions");
    }

    if (this.disposed) {
      disposer();
      return () => undefined;
    }

    const entry: CleanupEntry = { disposer, active: true };
    this.entries.add(entry);
    return () => {
      if (!entry.active) {
        return;
      }
      entry.active = false;
      this.entries.delete(entry);
    };
  }

  onCleanup(disposer: Disposer): Disposer {
    return this.add(disposer);
  }

  child(): Lifetime {
    const child = new Lifetime();
    const removeChild = this.add(() => child.dispose());
    child.add(removeChild);
    return child;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;

    const errors: unknown[] = [];
    const entries = Array.from(this.entries).reverse();
    this.entries.clear();
    for (const entry of entries) {
      if (!entry.active) {
        continue;
      }
      entry.active = false;
      try {
        entry.disposer();
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length === 1) {
      throw errors[0];
    }
    if (errors.length > 1) {
      throw new AggregateError(errors, "One or more lifetime disposers failed");
    }
  }
}
