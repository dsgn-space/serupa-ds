// The proof brand: a Storybook-only theme that changes everything a brand can change at once, so whatever doesn't
// follow it is a value a component hard-codes. It isn't shipped and has no screenshots of its own; pick "Proof" in the
// Brand toolbar to look, and node tools/test/proof-brand.mjs lists what leaks, story by story.
//   Typeface   a serif (Georgia) instead of Inter
//   Corners    sharp: every rounded-* step and radius role 0, apart from rounded-full (avatars, switches, dots)
//   Neutrals   warm: stone instead of zinc
//   Brand      indigo instead of blue
//   Statuses   emerald, yellow, rose and cyan instead of green, amber, red and sky
//   Density    compact control heights
//   Shadows    hard offset shadows with no blur, in the text color
// The colors are the blue theme's aliases with their palette families swapped, read from tokens.json, so a new alias
// follows with no edit here.
type Theme = { id: string };
type Token = { name: string; value: unknown };
type Tokens = { color: { themes: Theme[]; tokens: Token[] }; radius: { tokens: Token[] } };

export const PROOF_SWAP: Record<string, string> = { zinc: 'stone', blue: 'indigo', green: 'emerald', amber: 'yellow', red: 'rose', sky: 'cyan' };
const swap = (ref: string) => ref.replace(/^\{([a-z]+)-(\d+)\}$/, (m, fam: string, step: string) => `var(--${PROOF_SWAP[fam] || fam}-${step})`)
  .replace(/^\{(white|black)\}$/, 'var(--$1)');

export function proofCss(tokens: Tokens): string {
  const mode = (m: 'light' | 'dark') => tokens.color.tokens
    .filter((t) => t.value && typeof t.value === 'object' && /^\{[a-z]+(-\d+)?\}$/.test(String((t.value as Record<string, string>)[`blue-${m}`])))
    .map((t) => `  --${t.name}: ${swap((t.value as Record<string, string>)[`blue-${m}`])};`).join('\n');
  const radii = tokens.radius.tokens.map((t) => t.name).filter((n) => n !== 'rounded-full' && n !== 'radius-pill').map((n) => `  --${n}: 0;`).join('\n');
  const hard = (x: number, y: number, a: number) => `${x}px ${y}px 0 0 rgb(from var(--text) r g b / ${a})`;
  return `[data-theme="proof-light"], [data-theme="proof-dark"] {
  --font-sans: Georgia, "Times New Roman", ui-serif, serif;
${radii}
  --control-height-sm: 1.5rem;
  --control-height-md: 1.75rem;
  --control-height-lg: 2.25rem;
  --shadow-2xs: ${hard(1, 1, 0.5)};
  --shadow-xs: ${hard(1, 1, 0.6)};
  --shadow-sm: ${hard(2, 2, 0.6)};
  --shadow-md: ${hard(3, 3, 0.7)};
  --shadow-lg: ${hard(4, 4, 0.7)};
  --shadow-xl: ${hard(6, 6, 0.8)};
  --shadow-2xl: ${hard(8, 8, 0.8)};
}
[data-theme="proof-light"] {
${mode('light')}
}
[data-theme="proof-dark"] {
${mode('dark')}
}
`;
}
