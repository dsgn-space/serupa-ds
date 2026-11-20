// The React Compiler over the package's client components (ADR-0017): each component and hook in a "use client"
// file is memoized as the compiler sees fit, so an app gets fewer re-renders without running the compiler itself (a
// project's bundler leaves node_modules alone). The build (build.mjs) and the component tests (vitest.config.ts) both
// go through this, so the tests run the code that ships.
// A file without "use client" is a server component or plain helpers: the compiler's cache hook can't run on the
// server, so those stay as they are. A function the compiler can't prove safe (the findings eslint-suppressions.json
// holds) is left as written: panicThreshold 'none' skips it instead of failing the build.
import babel from '@babel/core';
import compiler from 'babel-plugin-react-compiler';

const CLIENT = /^\s*(\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*['"]use client['"]/;
const SOURCE = /[\\/]src[\\/](components|internal)[\\/][^?]*\.tsx$/;
const NOT_SHIPPED = /\.(test|stories)\.tsx$/;

/** True for a source file the compiler goes over. */
export const compiles = (file, code) => SOURCE.test(file) && !NOT_SHIPPED.test(file) && CLIENT.test(code);

/** The file compiled (TypeScript and JSX kept for the next step), with its map. */
export async function compileReact(file, code) {
  const out = await babel.transformAsync(code, {
    filename: file, babelrc: false, configFile: false, sourceMaps: true,
    parserOpts: { plugins: ['typescript', 'jsx'] },
    plugins: [[compiler, { target: '19', panicThreshold: 'none' }]],
  });
  return { code: out.code, map: out.map };
}
