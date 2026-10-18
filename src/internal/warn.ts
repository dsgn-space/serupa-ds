const warned: Record<string, 1> = {};

/** A console warning, once per key for the page's lifetime. */
export function warnOnce(key: string, msg: string): void {
  if (!warned[key] && typeof console !== "undefined") {
    warned[key] = 1;
    console.warn(msg);
  }
}
