import * as ALL from '../src/material/icons';
import { COMMON_ICONS } from '../src/material/common';
import type { IconData } from '../src/material/types';

/* A Storybook control for icon props that lists every Material Symbol. An everyday icon is passed by name,
   as an app would; any other is passed as its imported icon data (icon={Category}), so the preview matches real use. */
const everyday = new Set(COMMON_ICONS.map((i) => i.name));
const all = (Object.values(ALL) as IconData[]).filter((d) => d && typeof d.name === 'string').sort((a, b) => a.name.localeCompare(b.name));

export const iconArg = {
  control: { type: 'select' as const },
  options: ['(none)', ...all.map((d) => d.name)],
  mapping: { '(none)': undefined, ...Object.fromEntries(all.filter((d) => !everyday.has(d.name)).map((d) => [d.name, d])) },
  labels: Object.fromEntries(all.filter((d) => !everyday.has(d.name)).map((d) => [d.name, `${d.name} (import)`])),
  description: 'Every Material Symbol. Everyday icons work by name; the ones marked (import) are passed as imported icons in your app: `import { Category } from "serupa-ds/icons"`, then `icon={Category}`. Foundations/Icons finds any icon and copies the code.',
};
