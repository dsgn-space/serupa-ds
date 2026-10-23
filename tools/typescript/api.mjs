// TypeScript 7 (the typescript package) has no compiler API yet. The tools that load it as a library, typescript-eslint and
// Storybook's prop tables (react-docgen-typescript), get TypeScript 6's from @typescript/typescript6, the TypeScript
// team's package for exactly this. Importing this file points every later import or require of "typescript" in the
// process there; tsc itself (npm run typecheck) runs TypeScript 7.
import { registerHooks } from 'node:module';

registerHooks({
  resolve: (specifier, context, next) => next(specifier === 'typescript' || specifier.startsWith('typescript/') ? '@typescript/typescript6' + specifier.slice('typescript'.length) : specifier, context),
});
