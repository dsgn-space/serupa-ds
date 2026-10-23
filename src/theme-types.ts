export type ThemeBrand = 'blue' | 'violet' | 'emerald';
export type ThemeMode = 'auto' | 'light' | 'dark';
export interface ThemeInfo { brand: ThemeBrand; /** What was asked for. */ mode: ThemeMode; /** What is applied, e.g. "violet-dark". */ theme: string }
/** theme.js (standalone, no React): picks the page theme and follows the system's light/dark setting. */
export interface SerupaTheme {
  get(): ThemeInfo;
  /** Change and remember the choice in this browser. Unknown values are ignored. */
  set(choice: { brand?: ThemeBrand; mode?: ThemeMode }): ThemeInfo;
  /** Forget the choice; back to the page's data-brand / data-mode. */
  reset(): ThemeInfo;
  /** Called after every change; returns an unsubscribe function. */
  onChange(fn: (info: ThemeInfo) => void): () => void;
}
