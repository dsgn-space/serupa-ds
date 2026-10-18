import * as ALL from '../src/material/icons';
import type { IconData } from '../src/material/types';

/** A Storybook control for icon props: every Material Symbol, by name. */
const names = (Object.values(ALL) as IconData[]).filter((d) => d && typeof d.name === 'string').map((d) => d.name).sort();

export const iconArg = {
  control: { type: 'select' as const },
  options: ['(none)', ...names],
  mapping: { '(none)': undefined },
  description: 'Any Material Symbol by name, such as `category`. Foundations/Icons has a searchable list.',
};
