/** Serupa's themes, in the order the docs show them: a light and a dark one for each brand color. */
export type SerupaTheme = 'blue-light' | 'blue-dark' | 'red-light' | 'red-dark' | 'orange-light' | 'orange-dark' | 'amber-light' | 'amber-dark' | 'yellow-light' | 'yellow-dark' | 'lime-light' | 'lime-dark' | 'green-light' | 'green-dark' | 'emerald-light' | 'emerald-dark' | 'teal-light' | 'teal-dark' | 'cyan-light' | 'cyan-dark' | 'sky-light' | 'sky-dark' | 'indigo-light' | 'indigo-dark' | 'violet-light' | 'violet-dark' | 'purple-light' | 'purple-dark' | 'fuchsia-light' | 'fuchsia-dark' | 'pink-light' | 'pink-dark' | 'rose-light' | 'rose-dark';
export declare const THEMES: readonly SerupaTheme[];

/** What forEachTheme needs from a page: Playwright's Page fits, and so does anything with the same evaluate(). */
export interface ThemedPage {
  evaluate<R, A>(fn: (arg: A) => R | Promise<R>, arg: A): Promise<R>;
  /** Used when it's there, so prefers-color-scheme matches each theme. */
  emulateMedia?(options: { colorScheme: 'light' | 'dark' | null }): Promise<void>;
}

export interface ForEachThemeOptions {
  /** Only these themes, in this order. Default: every theme; name the ones your app uses. */
  themes?: readonly SerupaTheme[];
  /** Turn off transitions, animations and the text caret while it runs. Default: true. */
  still?: boolean;
}

/** Draws the page in each theme in turn (data-theme on <html>, the matching color scheme, fonts loaded, transitions
 *  off) and calls fn with the theme's name, for a screenshot. Puts the page back as it was afterwards, even when fn
 *  throws.
 *  @example await forEachTheme(page, (theme) => expect(page).toHaveScreenshot(`home-${theme}.png`)); */
export declare function forEachTheme(page: ThemedPage, fn: (theme: SerupaTheme) => unknown, options?: ForEachThemeOptions): Promise<void>;
