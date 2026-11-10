/* eslint-disable @typescript-eslint/no-explicit-any, no-var -- page code is untyped there, and a declared global takes var */
// What the suites' page.evaluate() code finds in the page: the IIFE build (window.Serupa), axe, and the hooks a test
// page sets for itself (window.heard, window.show, …). That code runs in the browser, where these are untyped, so
// any name on window is allowed here, as it is there.
interface Window {
  [name: string]: any;
}
// querySelector() gives an Element; the suites read .style, .dataset and blur() off what is, on those pages, always
// an HTML element.
interface Element {
  readonly style: CSSStyleDeclaration;
  readonly dataset: DOMStringMap;
  blur(): void;
  focus(options?: FocusOptions): void;
}
// The IIFE build's global, as page code names it bare (Serupa.theme.set()).
declare var Serupa: any;
