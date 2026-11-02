// The test files that turn on touch emulation (coarsePointer in helpers.ts). They run in a browser instance of their
// own (vitest.config.ts): once touch emulation has been on, a Chromium page never gets its hovering mouse back.
export const TOUCH = ['src/styles/touchTargets.test.tsx'];
