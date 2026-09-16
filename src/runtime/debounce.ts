export type Debounced = ((...args: any[]) => void) & { cancel: () => void };

export function debounce<T extends (...args: any[]) => void>(fn: T, waitMs: number): Debounced {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = ((...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, waitMs);
  }) as Debounced;
  debounced.cancel = () => {
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    timer = undefined;
  };
  return debounced;
}
