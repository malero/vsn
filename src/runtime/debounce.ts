type Debounced = (...args: any[]) => void;

export function debounce<T extends (...args: any[]) => void>(fn: T, waitMs: number): Debounced {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, waitMs);
  };
}
