// The browser script (serupa.iife.js): reads React from window.React and puts
// the components on window.Serupa, for plain pages without a bundler.
import * as Serupa from "./index";

// Everything the package exports (index.ts), so a new component reaches plain pages without a line here.
window.Serupa = Object.assign(window.Serupa || {}, Serupa);
