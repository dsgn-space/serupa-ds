// The props tables, read from the TypeScript types and their TSDoc with react-docgen-typescript: the same reader,
// with the same options, as Storybook's <Controls /> (.storybook/main.ts imports docgenOptions from here), so the
// site's table and Storybook's can't say different things.
//   node tools/site/props.mjs Button     prints one component's table as JSON
// TypeScript 7 has no compiler API yet, so this reads the types with TypeScript 6's (tools/typescript/api.mjs).
import '../typescript/api.mjs';
import fs from 'node:fs';
import path from 'node:path';
import ts from '@typescript/typescript6';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

/** react-docgen-typescript's options, for Storybook's props tables and the site's. */
export const docgenOptions = {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => {
    // A tag in the TSDoc ("renders a <button>") is code here, not HTML the docs page should render.
    prop.description = prop.description.replace(/(?<!`)<\/?[a-z][\w-]*(?:\s[^<>]*)?>(?!`)/g, '`$&`');
    // Props typed only as undefined (href on the <button> form of Button) exist to rule a combination out, and
    // @internal ones (Calendar's plumbing for DateRangePicker) aren't in the package's public types. React's own DOM
    // attributes stay out: every component takes them, and they'd bury its own props.
    return prop.type.name !== 'undefined' && !('internal' in (prop.tags ?? {})) && (!prop.parent || !/node_modules/.test(prop.parent.fileName));
  },
};

/** A prop's type as the table shows it: the union's values for an enum, else the type's own text. */
const typeText = (t) => (t.name === 'enum' && Array.isArray(t.value) ? t.value.map((v) => v.value).join(' | ') : t.raw || t.name);

/**
 * Each component's props, by folder name: the components its <Name>.tsx exports, the one the folder is named for
 * first, each with its props (required first, then as declared).
 * @param {string[]} names the component folders to read
 * @returns {Promise<Record<string, { name: string, description: string, props: { name: string, type: string, required: boolean, default: string | null, description: string, deprecated: string | null }[] }[]>>}
 */
export async function componentProps(names, root = ROOT) {
  const { withCustomConfig } = await import('react-docgen-typescript');
  const files = names.map((n) => path.join(root, 'src', 'components', n, `${n}.tsx`)).filter((f) => fs.existsSync(f));
  const parser = withCustomConfig(path.join(root, 'tsconfig.json'), docgenOptions);
  // One program for every file: a program per file would read React's types 120 times.
  const config = ts.getParsedCommandLineOfConfigFile(path.join(root, 'tsconfig.json'), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
  const program = ts.createProgram(files, config.options);
  const out = {};
  for (const file of files) {
    const name = path.basename(file, '.tsx');
    const docs = parser.parseWithProgramProvider(file, () => program);
    // The components the folder's index.ts exports: a helper beside them (buttonClass) or a part kept inside isn't one.
    const index = fs.readFileSync(path.join(path.dirname(file), 'index.ts'), 'utf8');
    const exported = new Set([...index.matchAll(/^export \{([^}]*)\}/gm)].flatMap((m) => m[1].split(',').map((v) => v.trim().split(/\s+as\s+/).pop())));
    out[name] = docs
      .filter((d) => /^[A-Z]/.test(d.displayName) && exported.has(d.displayName))
      .map((d) => ({
        name: d.displayName,
        description: d.description,
        props: Object.values(d.props)
          .map((p) => ({
            name: p.name, type: typeText(p.type), required: p.required,
            default: p.defaultValue?.value != null ? String(p.defaultValue.value) : null,
            description: p.description, deprecated: /** @type {Record<string, string> | undefined} */ (p.tags)?.deprecated ?? null,
          }))
          .sort((a, b) => Number(b.required) - Number(a.required)),
      }))
      .filter((d) => d.props.length)
      .sort((a, b) => Number(b.name === name) - Number(a.name === name));
  }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  console.log(JSON.stringify(await componentProps(process.argv.slice(2)), null, 1));
}
