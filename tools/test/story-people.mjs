// Stories that show people follow Storybook's Content menu (KW9, CONTRIBUTING's worst-case review): one that names a
// person (an Avatar's name, a message's author, an event's actor) takes its names from .storybook/content.ts
// (usePeople, useNames, useName or useNameMap), so the menu's "Worst case" shows long, one-letter, emoji and
// right-to-left names there too. A story file that names someone and reads none of them fails.
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, done, report } from './lib.mjs';

// A person's name written into a story: two capitalized words, in an Avatar's name, an author or an actor.
const PERSON = /(?:<Avatar\b[^>]*\bname="|\bauthor="|\b(?:author|actor): \{ name: ')\p{Lu}[\p{L}'’-]+ \p{Lu}/u;
const READS = /\buse(?:People|Names|Name|NameMap)\(/;
// Names that are the subject of the story, not sample people: these stay as written.
const OWN = new Set([
  'src/internal/KitchenSink/KitchenSink.stories.tsx',   // every component on one page, a fixed picture for the visual check
]);
const files = fs.readdirSync(path.join(PROJECT, 'src'), { recursive: true }).map((f) => 'src/' + String(f).split(path.sep).join('/')).filter((f) => f.endsWith('.stories.tsx')).sort();
const named = files.filter((f) => !OWN.has(f) && PERSON.test(fs.readFileSync(path.join(PROJECT, f), 'utf8')));
const fixed = named.filter((f) => !READS.test(fs.readFileSync(path.join(PROJECT, f), 'utf8')));
done(report('Stories with people', [
  { name: `the story files were read (${files.length})`, ok: files.length > 100, detail: `${files.length} story files under src/` },
  { name: `every story file that names a person follows the Content menu (${named.length} name people)`, ok: !fixed.length && named.length > 3,
    detail: fixed.length ? `names people without usePeople, useNames, useName or useNameMap (.storybook/content.ts): ${fixed.join(', ')}` : 'the pattern found too few story files with people' },
]));
