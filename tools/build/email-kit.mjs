// An email-safe kit (139): Serupa's colors, type and spacing for HTML email, where most clients drop CSS variables,
// rem, rgba(), cascade layers and <link>ed stylesheets. npm run build writes them into dist/email/:
//   <brand>.css     the email classes (serupa-body, serupa-button, serupa-callout-info, …) with every value written
//                   out in hex and px, light first, then the dark theme under prefers-color-scheme for the clients
//                   that honor it. Inline it with an inliner (juice, Premailer, or the one your sender has).
//   <brand>.html    a starting email with those styles already inline: a table layout 600px wide, a preview line,
//                   a heading, text, a button that is a link padded inside a cell, a callout, a divider and a
//                   footer. Outlook for Windows draws with Word, which ignores padding on a link, so the cell carries
//                   the same padding as mso-padding-alt (which only Outlook reads) and the link's is zeroed there. Its <style> keeps only the dark theme, which can't be inlined.
//   tokens.json     every alias color of each theme in hex (a color with alpha mixed over its surface first), and
//                   the type sizes, spacing and radii in px, for a template language or an email builder.
import { nativeTokens } from './native-tokens.mjs';

// Inter where the reader has it, then each system's own sans-serif. No web font: most clients don't load one.
export const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const WIDTH = 600;

const hex2 = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
/** A color as #rrggbb; one with alpha is mixed over `under` first, since many clients ignore alpha. */
export function solid(c, under) {
  if (c.a >= 1 || !under) return c.hex.toLowerCase();
  return '#' + [c.r, c.g, c.b].map((x, i) => hex2(x * c.a + [under.r, under.g, under.b][i] * (1 - c.a))).join('');
}

/** Every theme's colors as hex: { 'blue-light': { primary: '#2563eb', … }, … }. */
export function emailColors(dir) {
  const { aliases } = nativeTokens(dir);
  return Object.fromEntries(Object.entries(aliases).map(([th, list]) => {
    const surface = list.find((x) => x.name === 'surface').value;
    return [th, Object.fromEntries(list.map((x) => [x.name, solid(x.value, surface)]))];
  }));
}

/** The sizes an email uses, in px: { text: { sm: [14, 20] }, spacing: { 4: 16 }, radius: { md: 6 } }. */
export function emailSizes(dir) {
  const { scalar } = nativeTokens(dir);
  const get = (n) => scalar.find((x) => x.name === n)?.value;
  const text = {};
  for (const x of scalar) {
    const m = x.kind === 'font' && x.name.match(/^text-([a-z0-9]+)$/);
    if (m && get(`${x.name}--line-height`) != null) text[m[1]] = [x.value, get(`${x.name}--line-height`)];
  }
  const pick = (prefix) => Object.fromEntries(scalar.filter((x) => x.kind === 'size' && x.name.startsWith(prefix) && !/[.]/.test(x.name)).map((x) => [x.name.slice(prefix.length) || 'default', x.value]));
  return { text, spacing: pick('spacing-'), radius: { ...pick('rounded-'), default: get('rounded') } };
}

const TONES = ['info', 'success', 'warning', 'danger'];

/** The email classes, each a list of [property, value], for one theme's colors. */
export function emailRules(c, s) {
  const type = (k) => [['font-size', `${s.text[k][0]}px`], ['line-height', `${s.text[k][1]}px`]];
  const sp = (n) => `${s.spacing[n]}px`;
  const rules = {
    'serupa-body': [['margin', '0'], ['padding', '0'], ['width', '100%'], ['background-color', c['surface-muted']], ['color', c.text], ['font-family', FONT]],
    'serupa-container': [['width', '100%'], ['max-width', `${WIDTH}px`], ['background-color', c.surface], ['border', `1px solid ${c.border}`], ['border-radius', `${s.radius.lg}px`]],
    'serupa-content': [['padding', `${sp(8)} ${sp(8)}`], ['font-family', FONT], ['color', c.text]],
    'serupa-h1': [['margin', `0 0 ${sp(4)}`], ['font-family', FONT], ['font-weight', '600'], ['color', c.text], ...type('2xl')],
    'serupa-h2': [['margin', `0 0 ${sp(3)}`], ['font-family', FONT], ['font-weight', '600'], ['color', c.text], ...type('xl')],
    'serupa-text': [['margin', `0 0 ${sp(4)}`], ['font-family', FONT], ['color', c.text], ...type('base')],
    'serupa-muted': [['margin', `0 0 ${sp(4)}`], ['font-family', FONT], ['color', c['text-muted']], ...type('sm')],
    'serupa-link': [['color', c.primary], ['text-decoration', 'underline']],
    'serupa-button-cell': [['background-color', c.primary], ['border-radius', `${s.radius.md}px`], ['mso-padding-alt', `${sp(3)} ${sp(5)}`]],
    'serupa-button': [['display', 'inline-block'], ['padding', `${sp(3)} ${sp(5)}`], ['font-family', FONT], ['font-weight', '600'], ['color', c['on-primary']], ['background-color', c.primary], ['border-radius', `${s.radius.md}px`], ['text-decoration', 'none'], ...type('base'), ['mso-padding-alt', '0']],
    'serupa-divider': [['border-top', `1px solid ${c.border}`], ['font-size', '0'], ['line-height', '0'], ['height', '1px']],
    'serupa-footer': [['padding', `0 ${sp(8)} ${sp(6)}`], ['font-family', FONT], ['color', c['text-muted']], ...type('xs')],
  };
  // A callout's accent bar is on its start side: left, and right in a right-to-left email (the -rtl class), since
  // email clients don't read border-inline-start.
  for (const t of TONES) {
    const callout = (side) => [['padding', `${sp(3)} ${sp(4)}`], ['background-color', c[`${t}-subtle`]], [`border-${side}`, `4px solid ${c[t]}`], ['color', c[`${t}-text`]], ['font-family', FONT], ...type('sm')];
    rules[`serupa-callout-${t}`] = callout('left');
    rules[`serupa-callout-${t}-rtl`] = callout('right');
  }
  return rules;
}

const decl = (list, important = '') => list.map(([p, v]) => `${p}: ${v}${important}`).join('; ');
const css = (rules, indent = '', important = '') => Object.entries(rules).map(([k, v]) => `${indent}.${k} { ${decl(v, important)}; }`).join('\n');
// Only what changes between light and dark goes in the dark block: the colors.
const colorsOnly = (rules) => Object.fromEntries(Object.entries(rules).map(([k, v]) => [k, v.filter(([p]) => /color$|^border(-top|-left|-right)?$/.test(p))]).filter(([, v]) => v.length));

/** The files of dist/email/, by their path in it. */
export function emailFiles(dir, version) {
  const colors = emailColors(dir);
  const sizes = emailSizes(dir);
  const brands = [...new Set(Object.keys(colors).map((t) => t.split('-')[0]))];
  const files = {};
  const head = `Serupa ${version}: the email-safe kit, generated from design-tokens/ (tools/build/email-kit.mjs). Don't edit.`;
  for (const b of brands) {
    const light = emailRules(colors[`${b}-light`], sizes);
    const dark = colorsOnly(emailRules(colors[`${b}-dark`], sizes));
    const darkCss = `@media (prefers-color-scheme: dark) {\n${css(dark, '  ', ' !important')}\n}`;
    files[`${b}.css`] = `/* ${head}\n   Plain CSS for HTML email: hex colors and px only. Inline it before sending; the dark block stays in <style>. */\n:root { color-scheme: light dark; supported-color-schemes: light dark; }\n${css(light)}\n\n${darkCss}\n`;
    const st = (k) => `class="${k}" style="${decl(light[k])}"`;
    files[`${b}.html`] = `<!doctype html>
<!-- ${head} -->
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Your order has shipped</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
${darkCss.replace(/^/gm, '    ')}
  </style>
</head>
<body ${st('serupa-body')}>
  <!-- The preview line most inboxes show after the subject; hidden in the email itself. -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all">Your order is on its way and should arrive on Thursday.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ${st('serupa-body')}>
    <tr>
      <td align="center" style="padding: ${sizes.spacing[6]}px ${sizes.spacing[4]}px">
        <table role="presentation" width="${WIDTH}" cellpadding="0" cellspacing="0" border="0" ${st('serupa-container')}>
          <tr>
            <td ${st('serupa-content')}>
              <h1 ${st('serupa-h1')}>Your order has shipped</h1>
              <p ${st('serupa-text')}>Hi Sam, your order is on its way and should arrive on Thursday. You can follow it from the link below.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 ${sizes.spacing[6]}px">
                <tr>
                  <td ${st('serupa-button-cell')}>
                    <a href="https://example.com/orders/1042" ${st('serupa-button')}>Track your order</a>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 ${sizes.spacing[6]}px">
                <tr>
                  <td ${st('serupa-callout-info')}>Someone needs to be home to sign for it.</td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td ${st('serupa-divider')}>&nbsp;</td></tr>
              </table>
              <p ${st('serupa-muted')}>Order 1042 · 2 items · <a href="https://example.com/orders/1042/receipt" ${st('serupa-link')}>View the receipt</a></p>
            </td>
          </tr>
          <tr>
            <td ${st('serupa-footer')}>You get this email because you ordered from Example. <a href="https://example.com/settings/email" ${st('serupa-link')}>Email settings</a></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
  }
  files['tokens.json'] = JSON.stringify({ $description: head, font: FONT, width: WIDTH, colors, ...sizes }, null, 2) + '\n';
  return files;
}
