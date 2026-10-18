// The browser script for every Material Symbol (serupa-icons.iife.js): load it after serupa.iife.js and any
// Material Symbols name works by name on the page. It holds all ~3,800 icons (about 1.5 MB), so a page that uses
// a few extra icons can instead call Serupa.registerIcons({ name, d }) with just those.
import * as icons from "./material/icons";

window.Serupa.registerIcons(icons);
