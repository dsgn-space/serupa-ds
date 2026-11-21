// The utility families 17.0.0 removed, and the check that keeps them out. Nothing in the system used them, and they
// were about 60% of the utility rules:
//   palette steps   bg-red-500, text-slate-700, border-zinc-200/50: a role class (bg-primary) follows the theme, a
//                   palette step doesn't. The palette tokens stay, for an app's own CSS (var(--red-500)).
//   masks, gradients  mask-*, bg-linear-*, bg-radial, bg-conic and the from-, via- and to- stops (utilities-extra.css)
//   filters         blur, brightness, contrast, grayscale, invert, sepia, hue-rotate, saturate, drop-shadow, backdrop-*
//   3D and transforms  rotate, scale, skew, perspective, backface, transform-*, origin-*, zoom (translate stays)
//   the rest        columns-*, break-after/before/inside, mix-blend, bg-blend, text-shadow, inset-shadow, inset-ring, tab-*
// and the scales inside a kept family that nothing used:
//   a color on one side of a border (border-t-danger; border-danger and the side widths stay), negative scroll
//   margins, the scroll margins and paddings on the right, bottom, left, block or block ends (scroll-mt-*, scroll-pt-*,
//   the inline ones and the all-sides ones stay), and translate on both axes or z (translate-x-* and -y-* stay)
// The template no longer writes them; the build fails if a template edit brings one back, and serupa-migrate lists the
// files that use one (bin/migrate/transforms.mjs, "utilities-trimmed").

/** A class 17.0.0 removed, without its responsive prefix (md:blur-sm is blur-sm), negative ones (-rotate-45) included. */
export const REMOVED = /^-?(?:mask(?:-|$)|bg-(?:linear|radial|conic)\b|(?:from|via|to)-|blur\b|brightness-|contrast-|grayscale\b|invert\b|sepia\b|hue-rotate-|saturate-|drop-shadow\b|backdrop-|filter\b|mix-blend-|bg-blend-|rotate-|skew-|scale-|perspective-|backface-|transform\b|zoom-|origin-|columns-|break-(?:after|before|inside)-|text-shadow\b|inset-shadow\b|inset-ring\b|tab-|scroll-[mp](?:r|b|l|y|bs|be)-|translate-(?!x-|y-|none$)|border-(?:[trblxy]|s|e|bs|be)-(?!(?:0|2|4|8)$)[a-z]|[a-z-]+-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)(?:\/[\d.]+)?$)|^-scroll-/;

const unescape = (c) => c.replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, '$1');

/** The classes a stylesheet's selectors name, without their responsive prefix. */
export function classesIn(css) {
  const sels = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{[^{}]*\}/g, '{}').match(/[^{}]+(?=\{\})/g) || [];
  return new Set(sels.flatMap((s) => [...s.matchAll(/\.((?:[A-Za-z0-9_-]|\\[0-9a-fA-F]{1,6} ?|\\.)+)/g)].map((m) => unescape(m[1]).replace(/^(?:[a-z0-9-]+:)+/, ''))));
}

/** Throws when the utility CSS has a class 17.0.0 removed. */
export function assertTrimmed(css) {
  const back = [...classesIn(css)].filter((c) => REMOVED.test(c));
  if (back.length) throw new Error(`utilities: ${back.length} classes 17.0.0 removed are back (tools/utilities/trimmed.mjs): ${back.slice(0, 10).join(', ')}`);
}
