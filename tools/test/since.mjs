// docs/since.json, the "Added in / changed in" line on each component's page (AX6): every entry has the shape the
// docs read, and tools/since.mjs moves an entry on to a release the way the Release pull request will.
//   node tools/test/since.mjs
import fs from 'node:fs';
import { done, report } from './lib.mjs';
import { FILE, advance, propsOf } from '../since.mjs';

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const VERSION = /^\d+\.\d+\.\d+$/;
const bad = Object.entries(data).filter(([, e]) => !(e.added === null || VERSION.test(e.added)) || !(e.changed === null || VERSION.test(e.changed))
  || typeof e.api !== 'string' || Object.values(e.props || {}).some((v) => !VERSION.test(v))).map(([k]) => k);

const v1 = 'interface AProps {\n    size?: "sm" | "md";\n    displayName: string;\n}\n';
const v2 = 'interface AProps {\n    size?: "sm" | "md";\n    readonly tone?: string;\n}\n';
const fresh = advance(undefined, v1, '16.0.0');
const moved = advance({ added: null, changed: null, api: 'x', props: {}, known: propsOf(v1) }, v2, '16.1.0');
const same = advance(moved, v2, '16.2.0');

done(report('Added in / changed in (docs/since.json)', [
  { name: 'there are entries, and Button is one', ok: !!data.Button },
  { name: 'each entry has a release (or null) for added and changed, and a release for each prop', ok: !bad.length, detail: bad.join(', ') },
  { name: "the props a .d.ts declares, without the wrapper's displayName", ok: JSON.stringify(propsOf(v1)) === '["size"]', detail: JSON.stringify(propsOf(v1)) },
  { name: 'a component new in a release is added in it', ok: fresh.added === '16.0.0' && fresh.changed === null },
  { name: 'a changed API is changed in the release, and only its new prop gets that release', ok: moved.changed === '16.1.0' && JSON.stringify(moved.props) === '{"tone":"16.1.0"}', detail: JSON.stringify(moved) },
  { name: 'an API that didn\'t change keeps its entry', ok: same === moved },
]));
