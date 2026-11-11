import type { Config } from 'stylelint';
/** A Stylelint config for an app's own CSS: serupa/no-raw-color, serupa/no-raw-spacing and serupa/no-raw-radius, on as errors;
 *  serupa/no-raw-motion (a duration, easing or `transition: all` written out), on as a warning.
 *  Use it with `extends: ["serupa-ds/stylelint"]`. */
declare const config: Config;
export default config;
