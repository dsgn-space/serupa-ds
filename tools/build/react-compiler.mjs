// The React Compiler over the package's client components (ADR-0017): each component and hook in a "use client"
// file is memoized as the compiler sees fit, so an app gets fewer re-renders without running the compiler itself (a
// project's bundler leaves node_modules alone). The build (build.mjs) and the component tests (vitest.config.ts) both
// go through this, so the tests run the code that ships.
// A file without "use client" is a server component or plain helpers: the compiler's cache hook can't run on the
// server, so those stay as they are. A function the compiler can't prove safe (the findings eslint-suppressions.json
// holds) is left as written: panicThreshold 'none' skips it instead of failing the build.
import path from 'node:path';
import { transformAsync } from '@babel/core';
import compiler from 'babel-plugin-react-compiler';

/** True when the file starts with "use client", after any comments. */
function isClient(code) {
  let i = 0;
  for (;;) {
    while (/\s/.test(code[i] ?? '')) i++;
    if (code.startsWith('//', i)) { const n = code.indexOf('\n', i); if (n < 0) return false; i = n + 1; }
    else if (code.startsWith('/*', i)) { const n = code.indexOf('*/', i + 2); if (n < 0) return false; i = n + 2; }
    else return code.startsWith("'use client'", i) || code.startsWith('"use client"', i);
  }
}
const SOURCE = /[\\/]src[\\/](components|internal)[\\/][^?]*\.tsx$/;
const NOT_SHIPPED = /\.(test|stories)\.tsx$/;

/** True for a source file the compiler goes over. */
export const compiles = (file, code) => SOURCE.test(file) && !NOT_SHIPPED.test(file) && isClient(code);

/** The file compiled (TypeScript and JSX kept for the next step), with its map. `onEvent` hears the compiler's own
 *  report on each function (tools/test/compiler.mjs lists the ones it skips). */
export async function compileReact(file, code, onEvent) {
  const out = await transformAsync(code, {
    filename: file, babelrc: false, configFile: false, sourceMaps: true,
    parserOpts: { plugins: ['typescript', 'jsx'] },
    plugins: [[compiler, { target: '19', panicThreshold: 'none', ...(onEvent ? { logger: { logEvent: (_file, event) => onEvent(event) } } : {}) }]],
  });
  // The cache comes from src/internal/memoCache.ts, not react/compiler-runtime, which Preact's compatibility lacks.
  const runtime = path.relative(path.dirname(file), path.join(file.slice(0, file.search(/[\\/]src[\\/]/)), 'src', 'internal', 'memoCache')).split(path.sep).join('/');
  const compiled = out.code.replace(/(["'])react\/compiler-runtime\1/, JSON.stringify(runtime.startsWith('.') ? runtime : './' + runtime));
  return { code: compiled, map: out.map };
}
