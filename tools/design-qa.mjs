// The themes Visual draws and the design-qa label signs off (ADR-0016): a theme is a brand color and a mode and
// nothing else, so three brands stand for all of them: blue (the default), violet (a dark accent) and yellow (a
// light one). Every theme's contrast is checked in the token and component tests; these are the ones with pictures
// (tools/test/visual.mjs) and axe runs (storybook.mjs). CI's visual-review job lays a pull request's pictures out.
export const THEMES = ['blue-light', 'blue-dark', 'yellow-light', 'yellow-dark', 'violet-light', 'violet-dark'];
