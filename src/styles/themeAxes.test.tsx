import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import tokens from '../../tokens.json';
import { render } from 'vitest-browser-react';
import { commands, page } from 'vitest/browser';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';
import { Input } from '../components/Input/Input';
import { List, ListItem } from '../components/List/List';
import { Table, TableBody, TableRow, TableCell } from '../components/Table/Table';
import { Switch } from '../components/Switch/Switch';
import { contrast, lowContrast, withMotion } from '../../tools/test/vitest/helpers';

// Theme axes (ADR-0011): data-brand and data-mode on an element without data-theme give the same colors as the
// flat data-theme="<brand>-<mode>" themes, through light-dark() pairs that the element's color-scheme resolves.
const root = document.documentElement;
type Tok = { name: string; value: unknown };
// Every brand tokens.json has a theme for, the default first.
// These tests are about the themes themselves, so they run in all of them, not only the ones the component tests use.
const THEMES = tokens.color.themes.map((t: { id: string }) => t.id);
const BRANDS = [...new Set(tokens.color.themes.map((t: { id: string }) => t.id.replace(/-(light|dark)$/, '')))];
const varying = (tokens.color.tokens as Tok[]).filter((t) => t.value && typeof t.value === 'object' && new Set(Object.values(t.value)).size > 1).map((t) => t.name);

// The resolved color of every varying token on a probe inside `host`.
function read(host: HTMLElement): Record<string, string> {
  const probe = document.createElement('span');
  host.appendChild(probe);
  const out: Record<string, string> = {};
  for (const n of varying) { probe.style.color = `var(--${n})`; out[n] = getComputedStyle(probe).color; }
  probe.remove();
  return out;
}
const badge = (host: HTMLElement) => {
  const b = document.createElement('span');
  b.className = 'srp-badge srp-badge--subtle';
  b.setAttribute('data-tone', 'red');
  b.style.background = 'var(--srp-bdg-red-sbg)';
  host.appendChild(b);
  const c = getComputedStyle(b).backgroundColor;
  b.remove();
  return c;
};
const axes = (brand?: string, mode?: string) => {
  root.removeAttribute('data-theme');
  if (brand) root.setAttribute('data-brand', brand); else root.removeAttribute('data-brand');
  if (mode) root.setAttribute('data-mode', mode); else root.removeAttribute('data-mode');
};

afterEach(() => { for (const a of ['data-brand', 'data-mode', 'data-contrast', 'data-density', 'data-shadow', 'data-type-scale', 'data-radius']) root.removeAttribute(a); root.setAttribute('data-theme', 'blue-light'); });

describe('Theme axes', () => {
  test('data-brand + data-mode give exactly the colors of each data-theme', () => {
    for (const th of THEMES) {
      const [brand, mode] = th.split('-');
      root.setAttribute('data-theme', th);
      const flat = read(document.body), flatBadge = badge(document.body);
      axes(brand, mode);
      expect(read(document.body), th).toEqual(flat);
      expect(badge(document.body), th + ' badge').toBe(flatBadge);
      expect(getComputedStyle(root).colorScheme, th).toBe(mode);
    }
  });

  test('auto follows the color-scheme; a data-mode section switches inside the page', () => {
    root.setAttribute('data-theme', 'violet-dark');
    const dark = read(document.body);
    root.setAttribute('data-theme', 'violet-light');
    const light = read(document.body);
    axes('violet', 'auto');
    expect(getComputedStyle(root).colorScheme).toBe('light dark');
    const section = document.createElement('section');
    section.setAttribute('data-mode', 'dark');
    document.body.appendChild(section);
    expect(read(section)).toEqual(dark);
    section.setAttribute('data-mode', 'light');
    expect(read(section)).toEqual(light);
    section.remove();
  });

  test('a data-brand section takes its brand inside another', () => {
    root.setAttribute('data-theme', 'emerald-dark');
    const emeraldDark = read(document.body);
    axes('blue', 'dark');
    const section = document.createElement('section');
    section.setAttribute('data-brand', 'emerald');
    document.body.appendChild(section);
    expect(read(section)).toEqual(emeraldDark);
    section.remove();
  });

  test('a data-mode section switches in any page: with no axes on the root, or inside each data-theme, keeping that theme\'s brand; with data-brand too it takes that brand', () => {
    const flat: Record<string, Record<string, string>> = {};
    for (const th of THEMES) { root.setAttribute('data-theme', th); flat[th] = read(document.body); }
    const section = document.createElement('section');
    document.body.appendChild(section);
    const cases: Array<[string | null, string, string | null, string]> = [[null, 'dark', null, 'blue-dark'], [null, 'dark', 'emerald', 'emerald-dark']];
    for (const th of THEMES) {
      const [brand, mode] = th.split('-'), other = mode === 'light' ? 'dark' : 'light';
      cases.push([th, other, null, `${brand}-${other}`], [th, mode!, null, th], [th, other, 'violet', `violet-${other}`]);
    }
    for (const [page, mode, brand, want] of cases) {
      if (page) root.setAttribute('data-theme', page); else axes();
      section.setAttribute('data-mode', mode);
      if (brand) section.setAttribute('data-brand', brand); else section.removeAttribute('data-brand');
      expect(read(section), `page ${page} section ${brand || ''} ${mode}`).toEqual(flat[want]);
      expect(getComputedStyle(section).colorScheme).toBe(mode);
    }
    section.remove();
  });

  test('data-contrast="more" on the page reaches a data-mode section', () => {
    root.setAttribute('data-theme', 'blue-dark');
    root.setAttribute('data-contrast', 'more');
    const strong = read(document.body);
    root.setAttribute('data-theme', 'blue-light');
    const section = document.createElement('section');
    section.setAttribute('data-mode', 'dark');
    document.body.appendChild(section);
    expect(read(section)).toEqual(strong);
    section.remove();
  });

  test('a root with neither attribute stays light, as before', () => {
    root.setAttribute('data-theme', 'blue-light');
    const flat = read(document.body);
    axes();
    expect(read(document.body)).toEqual(flat);
    expect(getComputedStyle(root).colorScheme).toBe('light');
  });
});

describe('Contrast axis', () => {
  // WCAG AAA text (7:1) and stronger boundaries, for people who ask their system for more contrast.
  const pairs: Array<[string, string, string, number]> = [
    ['text', 'var(--text)', 'var(--surface)', 7],
    ['muted text', 'var(--text-muted)', 'var(--surface)', 7],
    ['muted text on muted surface', 'var(--text-muted)', 'var(--surface-muted)', 7],
    ['placeholder', 'var(--placeholder)', 'var(--field)', 7],
    ['border', 'var(--border)', 'var(--surface)', 3],
    ['field border', 'var(--field-border)', 'var(--field)', 4.5],
    // Status text and icons (V6): on the page, on a raised card and on its own subtle fill (an Alert, a Badge).
    ...['success', 'warning', 'danger', 'info'].flatMap((s): Array<[string, string, string, number]> => [
      [`${s} text`, `var(--${s}-text)`, 'var(--surface)', 7],
      [`${s} text on a raised surface`, `var(--${s}-text)`, 'var(--surface-raised)', 7],
      [`${s} text on its subtle fill`, `var(--${s}-text)`, `var(--${s}-subtle)`, 7],
    ]),
    ...['success', 'warning', 'info'].map((s): [string, string, string, number] => [`${s} icon`, `var(--${s})`, 'var(--surface)', 4.5]),
    // The brand (V6 phase 2): each brand's own stronger shade, for links, the secondary button and the focus ring.
    ['brand text', 'var(--primary)', 'var(--surface)', 7],
    ['brand text on its tint', 'var(--primary)', 'var(--primary-subtle)', 7],
    ['brand text on hover', 'var(--primary-hover)', 'var(--primary-subtle)', 7],
    ['primary button text', 'var(--on-primary)', 'var(--primary)', 7],
    ['primary button text on hover', 'var(--on-primary)', 'var(--primary-hover)', 7],
    ['focus ring', 'var(--focus-ring)', 'var(--surface)', 4.5],
  ];

  test('data-contrast="more": 7:1 text and stronger borders in every theme', () => {
    expect(lowContrast(pairs)).not.toEqual([]);   // without it muted text is 4.5:1, so passing below is the attribute's work
    root.setAttribute('data-contrast', 'more');
    expect(lowContrast(pairs)).toEqual([]);
  });

  test('data-contrast="more": the focus ring is 3px instead of 2px, on any focused element', () => {
    const b = document.createElement('button');
    document.body.appendChild(b);
    b.style.outline = 'var(--focus-ring-width) solid';
    expect(getComputedStyle(b).outlineWidth).toBe('2px');
    root.setAttribute('data-contrast', 'more');
    expect(getComputedStyle(b).outlineWidth).toBe('3px');
    b.remove();
  });

  test('base.css: bare native controls and the caret take the brand color, and a nested theme its own', () => {
    const probe = (parent: HTMLElement) => {
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.style.color = 'var(--primary)';
      parent.appendChild(box);
      const st = getComputedStyle(box);
      return [st.accentColor, st.caretColor, st.color];
    };
    const section = document.createElement('section');
    section.setAttribute('data-theme', 'emerald-light');
    document.body.appendChild(section);
    const [outer, inner] = [probe(document.body), probe(section)];
    expect(outer).toEqual([outer[2], outer[2], outer[2]]);
    expect(inner).toEqual([inner[2], inner[2], inner[2]]);
    expect(inner[0]).not.toBe(outer[0]);
    document.querySelectorAll('input[type=checkbox]').forEach((x) => x.remove());
    section.remove();
  });

  test('works with the axes too, and outranks them', () => {
    for (const mode of ['light', 'dark']) {
      axes('violet', mode);
      const before = contrast('var(--text-muted)', 'var(--surface)');
      root.setAttribute('data-contrast', 'more');
      expect(contrast('var(--text-muted)', 'var(--surface)'), mode).toBeGreaterThan(Math.max(before, 7));
      root.removeAttribute('data-contrast');
    }
  });

  test('the brand keeps its hue: each brand gets its own stronger shade, from the axes and in a nested section', () => {
    const hue = (host: HTMLElement) => { const p = document.createElement('span'); host.appendChild(p); p.style.color = 'var(--primary)'; const c = getComputedStyle(p).color; p.remove(); return c; };
    const swatch = (name: string) => { const p = document.createElement('span'); document.body.appendChild(p); p.style.color = `var(--${name})`; const c = getComputedStyle(p).color; p.remove(); return c; };
    for (const [brand, mode, shade] of [['violet', 'light', 'violet-800'], ['emerald', 'dark', 'emerald-300'], ['yellow', 'light', 'yellow-900'], ['blue', 'dark', 'blue-300']]) {
      axes(brand, mode);
      root.setAttribute('data-contrast', 'more');
      expect(hue(document.body), `${brand}-${mode}`).toBe(swatch(shade!));
      root.removeAttribute('data-contrast');
    }
    // A violet page asking for more contrast, with an emerald dark section and a flat blue-light one inside it.
    axes('violet', 'light');
    root.setAttribute('data-contrast', 'more');
    const emerald = document.createElement('section');
    emerald.setAttribute('data-brand', 'emerald');
    emerald.setAttribute('data-mode', 'dark');
    const blue = document.createElement('section');
    blue.setAttribute('data-theme', 'blue-light');
    document.body.append(emerald, blue);
    expect(hue(emerald)).toBe(swatch('emerald-300'));
    expect(hue(blue)).toBe(swatch('blue-800'));
    // …and without it, the normal shades.
    root.removeAttribute('data-contrast');
    expect(hue(emerald)).toBe(swatch('emerald-400'));
    expect(hue(blue)).toBe(swatch('blue-600'));
    emerald.remove();
    blue.remove();
  });

  test('tokens.css follows prefers-contrast: more unless the page says data-contrast="normal"', async () => {
    const walk = (rules: CSSRuleList): CSSRule[] => [...rules].flatMap((r) => [r, ...('cssRules' in r ? walk((r as CSSGroupingRule).cssRules) : [])]);
    const all = [...document.styleSheets].flatMap((sh) => { try { return walk(sh.cssRules); } catch { return []; } });
    const media = all.filter((r) => r instanceof CSSMediaRule && r.conditionText.includes('prefers-contrast: more'));
    expect(media.map((r) => r.cssText).join('')).toContain(':root:not([data-contrast="normal"])');
  });
});

describe('Density axis', () => {
  test('data-density="compact": md and lg controls get shorter, sm keeps the 24px target; comfortable puts them back', async () => {
    root.setAttribute('data-density', 'compact');
    await render(<div>
      <Button id="b-md">Save</Button><Button id="b-sm" size="sm">Save</Button><Button id="b-lg" size="lg">Save</Button>
      <Input id="i-md" aria-label="Name" />
      <div data-density="comfortable"><Button id="b-back">Save</Button></div>
    </div>);
    const h = (id: string) => document.getElementById(id)!.getBoundingClientRect().height;
    expect([h('b-sm'), h('b-md'), h('b-lg'), h('b-back')]).toEqual([24, 28, 36, 32]);
    expect(document.getElementById('i-md')!.closest('[data-component="input"]')!.getBoundingClientRect().height).toBe(28);
  });
  test('data-density="compact": table and list rows and cards take less padding; comfortable puts it back', async () => {
    const section = (density?: string) => (
      <div data-density={density}>
        <Table caption="T"><TableBody><TableRow><TableCell>Cell</TableCell></TableRow></TableBody></Table>
        <Table caption="S" size="sm"><TableBody><TableRow><TableCell>Small</TableCell></TableRow></TableBody></Table>
        <List aria-label="L"><ListItem title="Item" /></List>
        <Card>Card</Card>
        <Card padding="lg">Large card</Card>
      </div>
    );
    const pads = (scope: Element) => [...scope.querySelectorAll('td'), scope.querySelector('li [class*="list__main"]'), ...scope.querySelectorAll('[data-component="card"]')]
      .map((e) => getComputedStyle(e as Element).paddingTop);
    const screen = await render(<>{section('compact')}{section('comfortable')}{section()}</>);
    const [compact, comfortable, normal] = [...screen.container.children];
    expect(pads(normal!)).toEqual(['12px', '8px', '12px', '20px', '24px']);
    expect(pads(compact!)).toEqual(['6px', '4px', '6px', '12px', '16px']);
    root.setAttribute('data-density', 'compact');
    expect(pads(comfortable!)).toEqual(['12px', '8px', '12px', '20px', '24px']);
  });
  test('data-radius: sharp and round reshape every radius role on any brand, and default puts the theme\'s back in a section', async () => {
    root.setAttribute('data-theme', 'violet-light');
    await render(<div>
      <Button id="r-page">Save</Button>
      <div id="r-surface" style={{ borderRadius: 'var(--radius-surface)' }}>Card</div>
      <section data-radius="default"><Button id="r-default">Save</Button></section>
      <section data-brand="blue"><Button id="r-blue">Save</Button></section>
      <section data-theme="blue-light" data-radius="default"><Button id="r-blue-default">Save</Button></section>
      <div id="r-pill" style={{ borderRadius: 'var(--radius-pill)' }}>Tag</div>
    </div>);
    const r = (id: string) => getComputedStyle(document.getElementById(id)!).borderTopLeftRadius;
    expect([r('r-page'), r('r-surface'), r('r-default'), r('r-blue-default')]).toEqual(['6px', '8px', '6px', '6px']);
    root.setAttribute('data-radius', 'sharp');
    expect([r('r-page'), r('r-surface'), r('r-default'), r('r-blue'), r('r-blue-default')]).toEqual(['2px', '4px', '6px', '2px', '6px']);
    root.setAttribute('data-radius', 'round');
    expect([r('r-page'), r('r-surface'), r('r-default'), r('r-blue')]).toEqual(['12px', '16px', '6px', '12px']);
    expect(r('r-pill')).toBe('9999px');
  });
  test('data-shadow="brand" (73): the box shadows take a deep shade of the brand color at the same opacity; a section with its own brand and data-shadow takes its own; neutral puts the black back', async () => {
    root.setAttribute('data-shadow', 'brand');
    const card = (id: string) => <div id={id} style={{ boxShadow: 'var(--shadow-md)' }}>Card</div>;
    await render(<div>
      {card('sh-page')}
      <section data-brand="emerald" data-shadow="brand">{card('sh-em')}</section>
      <section data-shadow="neutral">{card('sh-plain')}</section>
    </div>);
    // The first shadow's color as [r, g, b, alpha], 0 to 1.
    const rgba = (id: string) => {
      const s = getComputedStyle(document.getElementById(id)!).boxShadow;
      const srgb = /color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+) \/ ([\d.]+)\)/.exec(s), plain = /rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/.exec(s);
      if (srgb) return srgb.slice(1).map(Number);
      return plain!.slice(1).map((v, i) => (i < 3 ? Number(v) / 255 : Number(v)));
    };
    const [pr, pg, pb, pa] = rgba('sh-page'), [er, eg, eb] = rgba('sh-em');
    expect([pb! > pr! && pb! > pg!, eg! > er! && eg! > eb!, pa, rgba('sh-plain')]).toEqual([true, true, 0.1, [0, 0, 0, 0.1]]);
    // A deep shade: dark enough to read as shadow.
    expect(Math.max(pr!, pg!, pb!, er!, eg!, eb!)).toBeLessThan(0.35);
  });
  test('the elevation roles (I6) follow data-shadow in a section too: elevation-overlay is shadow-lg wherever it is read', async () => {
    const box = (id: string, v: string) => <div id={id} style={{ boxShadow: `var(${v})` }}>Menu</div>;
    await render(<div>
      {box('el-root', '--elevation-overlay')}
      <section data-shadow="brand">{box('el-brand', '--elevation-overlay')}{box('el-brand-lg', '--shadow-lg')}</section>
    </div>);
    const shadow = (id: string) => getComputedStyle(document.getElementById(id)!).boxShadow;
    expect(shadow('el-brand')).toBe(shadow('el-brand-lg'));
    expect(shadow('el-brand')).not.toBe(shadow('el-root'));
  });

  test('a theme is its colors: every brand draws every corner, shadow, border, surface, space and motion as blue does, in light and dark', async () => {
    await render(<div>
      <Button id="co-btn">Save</Button>
      <Button id="co-out" variant="outline">Later</Button>
      <Card id="co-card" padding="lg">Card</Card>
      <Card id="co-el" variant="elevated">Card</Card>
      <Switch id="co-sw">Wi-Fi</Switch>
      <Input id="co-in" aria-label="Name" />
      <div id="co-roles" style={{ borderRadius: 'var(--radius-surface)', padding: 'var(--space-section)', boxShadow: 'var(--elevation-modal)', background: 'var(--surface-muted)', borderBlockStart: '1px solid var(--border-strong)', outline: '1px solid var(--border-overlay)', transition: 'opacity var(--motion-enter-lg) var(--ease-pop), scale var(--motion-release) var(--ease-spring)' }}>Roles</div>
    </div>);
    const NOT_COLOR = ['borderTopLeftRadius', 'boxShadow', 'backgroundImage', 'paddingTop', 'paddingLeft', 'transitionDuration', 'transitionTimingFunction', 'transform', 'borderTopWidth'] as const;
    const NEUTRAL = ['borderTopColor', 'outlineColor'] as const;
    const read = (): Record<string, string[]> => withMotion(() => {
      const out: Record<string, string[]> = {};
      for (const id of ['co-btn', 'co-out', 'co-card', 'co-el', 'co-in', 'co-roles']) {
        const el = document.getElementById(id)!, c = getComputedStyle(id === 'co-in' ? el.parentElement! : el);
        // The cards, the field and the roles box are neutral all through; the buttons' fills are the brand's.
        const neutral = id === 'co-btn' || id === 'co-out' ? [] : [...NEUTRAL, 'backgroundColor' as const];
        out[id] = [...NOT_COLOR, ...neutral].map((p) => `${p}: ${c[p]}`);
      }
      const thumb = getComputedStyle(document.getElementById('co-sw')!.nextElementSibling!);
      out['co-sw'] = [thumb.transitionDuration, thumb.transitionTimingFunction, thumb.boxShadow];
      return out;
    });
    for (const mode of ['light', 'dark']) {
      root.setAttribute('data-theme', `blue-${mode}`);
      const blue = read();
      for (const brand of BRANDS.slice(1)) {
        root.setAttribute('data-theme', `${brand}-${mode}`);
        expect(read(), `${brand}-${mode}`).toEqual(blue);
      }
    }
  });
  test('a theme is its colors, in the tokens: only color aliases have a value per theme, and where the brands differ every value is a hue\'s shade, never a neutral', () => {
    const groups = Object.entries(tokens as unknown as Record<string, { tokens?: Tok[] }>).filter(([, g]) => Array.isArray(g?.tokens));
    const per = (t: Tok) => (t.value && typeof t.value === 'object' ? t.value as Record<string, string> : null);
    const varied = groups.flatMap(([g, grp]) => grp.tokens!.filter((t) => new Set(Object.values(per(t) ?? {})).size > 1).map((t) => [g, t] as const));
    expect(varied.filter(([g]) => g !== 'color').map(([, t]) => t.name)).toEqual([]);
    const hue = (v: string) => /^\{(?!zinc|slate|gray|neutral|stone)[a-z]+-\d+\}$/.test(v);
    const wrong: string[] = [];
    for (const [, t] of varied) for (const mode of ['light', 'dark']) {
      const v = Object.entries(per(t)!).filter(([th]) => th.endsWith(mode)).map(([, x]) => x);
      if (new Set(v).size > 1 && !v.every(hue)) wrong.push(`${t.name} (${mode}): ${v.join(', ')}`);
    }
    expect(wrong).toEqual([]);
    // Only the brand's own aliases differ from one brand to the next: the neutrals, the statuses and the charts don't.
    const brandOf = (t: Tok, mode: string) => new Set(Object.entries(per(t)!).filter(([th]) => th.endsWith(mode)).map(([, x]) => x)).size > 1;
    expect(varied.filter(([, t]) => brandOf(t, 'light') || brandOf(t, 'dark')).map(([, t]) => t.name).sort()).toEqual(['field-action', 'focus-ring', 'link-visited', 'on-primary', 'primary', 'primary-hover', 'primary-pressed', 'primary-subtle', 'primary-subtle-pressed']);
    // Each brand's own aliases read its own ramp (fuchsia's hover was violet): all but link-visited, which takes another
    // hue so a visited link isn't the primary; a neutral or white (on-primary on yellow, lime) is left to the check above.
    const offHue: string[] = [];
    for (const [, t] of varied) if (['field-action', 'focus-ring', 'on-primary', 'primary', 'primary-hover', 'primary-pressed', 'primary-subtle', 'primary-subtle-pressed'].includes(t.name)) for (const [th, v] of Object.entries(per(t)!)) {
      const ramp = /^\{([a-z]+)-\d+\}$/.exec(v)?.[1];
      if (ramp && !/^(zinc|slate|gray|neutral|stone)$/.test(ramp) && ramp !== th.replace(/-(light|dark)$/, '')) offHue.push(`${t.name} ${th}: ${v}`);
    }
    expect(offHue).toEqual([]);
    // A theme for every accent color of the palette, blue first, each light and dark and named after its color.
    expect(BRANDS).toEqual(['blue', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']);
    expect(tokens.color.themes.map((t: { id: string; name: string }) => `${t.id}: ${t.name}`)).toEqual(BRANDS.flatMap((b) => [`${b}-light: ${b[0]!.toUpperCase()}${b.slice(1)} Light`, `${b}-dark: ${b[0]!.toUpperCase()}${b.slice(1)} Dark`]));
    expect(groups.flatMap(([, g]) => g.tokens!).filter((t) => /^depth-/.test(t.name) || 'tactile' in t).map((t) => t.name)).toEqual([]);
  });
  test('GR333: the recessed surface sits on the other side of the page from the raised one in every theme, so dark keeps depth the right way round', () => {
    const lum = (c: string) => { const [r, g, b] = c.match(/[\d.]+/g)!.slice(0, 3).map((v) => { const x = Number(v) / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!; };
    const probe = document.createElement('span'); document.body.appendChild(probe);
    const col = (n: string) => { probe.style.color = `var(--${n})`; return lum(getComputedStyle(probe).color); };
    for (const th of THEMES) {
      root.setAttribute('data-theme', th);
      const [page, muted, raised] = [col('surface'), col('surface-muted'), col('surface-raised')];
      if (th.endsWith('-dark')) expect([muted < page, raised > page], th).toEqual([true, true]);
      else expect([muted < page, raised >= page], th).toEqual([true, true]);
    }
    probe.remove();
  });
  test('line heights sit on a 4px grid (AX9): the display style is 48px on 52px, and in the fluid scale each line follows its size, on the grid and never under it', async () => {
    await render(<div>
      <h1 id="lh-d" className="type-display">Launch</h1>
      <h1 id="lh-1" className="type-heading-1">Title</h1>
      <p id="lh-5" style={{ fontSize: 'var(--text-5xl)', lineHeight: 'var(--text-5xl--line-height)' }}>Big</p>
      <p id="lh-s" style={{ font: 'var(--text-type-display)' }}>Short</p>
    </div>);
    const lh = (id: string) => { const c = getComputedStyle(document.getElementById(id)!); return [parseFloat(c.fontSize), parseFloat(c.lineHeight)].map((v) => Math.round(v * 10) / 10); };   // to a tenth: WebKit reads 33.6px back as 33.599998, Firefox as 33.625
    const ids = ['lh-d', 'lh-1', 'lh-5', 'lh-s'];
    try {
      expect(ids.map(lh)).toEqual([[48, 52], [30, 36], [48, 48], [48, 52]]);
      root.setAttribute('data-type-scale', 'fluid');
      await page.viewport(1280, 700);
      expect(ids.map(lh)).toEqual([[48, 52], [30, 36], [48, 48], [48, 52]]);
      await page.viewport(320, 700);
      // 21px headings had a 36px line (1.71); the 33.6px sizes a 33.6px one, off the grid.
      expect(ids.map(lh)).toEqual([[33.6, 40], [21, 28], [33.6, 36], [33.6, 40]]);
    } finally { root.removeAttribute('data-type-scale'); await page.viewport(900, 700); }
  });
  test('data-type-scale="fluid" (22): text-2xl and up shrink to 70% on a 320px viewport and reach full size at 1280px; body sizes and fixed sections stay put; browser zoom doubles them by 300% (GR82)', async () => {
    root.setAttribute('data-type-scale', 'fluid');
    await render(<div>
      <h1 id="ft-h" className="type-heading-1">Title</h1>
      <p id="ft-9" style={{ fontSize: 'var(--text-9xl)' }}>Big</p>
      <p id="ft-b" className="type-body">Body</p>
      <p id="ft-x" className="text-xl">Text</p>
      <div data-type-scale="fixed"><h1 id="ft-f" className="type-heading-1">Title</h1></div>
    </div>);
    // To a tenth of a pixel: WebKit computes 70% of 128px as 89.599998px, and Firefox, which keeps lengths in sixtieths
    // of a pixel, as 89.63px.
    const px = (id: string) => Math.round(parseFloat(getComputedStyle(document.getElementById(id)!).fontSize) * 10) / 10;
    try {
      await page.viewport(320, 700);
      expect(['ft-h', 'ft-9', 'ft-b', 'ft-x', 'ft-f'].map(px)).toEqual([21, 89.6, 16, 20, 30]);
      await page.viewport(1280, 700);
      expect(['ft-h', 'ft-9', 'ft-b', 'ft-f'].map(px)).toEqual([30, 128, 16, 30]);
      await page.viewport(800, 700);
      const mid = px('ft-h');
      expect(mid > 21 && mid < 30).toBe(true);
      // WCAG 1.4.4 (GR82): browser zoom keeps 1rem at 16 CSS px and narrows the viewport, so Z% zoom in a W-wide
      // window draws Z/100 × the size at W / (Z/100). At 200% a heading grows about 1.6 times; by 300% it is at least
      // double in every window.
      for (const w of [640, 1280, 1440, 1920]) {
        await page.viewport(w, 700);
        const full = ['ft-h', 'ft-9'].map(px);
        await page.viewport(Math.round(w / 3), 700);
        const zoomed = ['ft-h', 'ft-9'].map((id) => 3 * px(id));
        zoomed.forEach((z, i) => expect(z / full[i]!, `${w}px window, 300% zoom`).toBeGreaterThanOrEqual(2));
      }
    } finally { await page.viewport(900, 700); }
  });

  test('a nested data-mode section has its own text color and page fill (surface-page), not the page\'s; a class background still wins', async () => {
    axes('blue', 'light');
    await render(<div><p id="np-out">Outside</p><section id="np" data-mode="dark"><p id="np-in">Inside</p></section>
      <section id="np2" data-mode="dark" style={{ backgroundColor: 'rgb(1, 2, 3)' }} /></div>);
    const cs = (id: string) => getComputedStyle(document.getElementById(id)!);
    const dark = read(document.getElementById('np')!);
    expect(cs('np-in').color).toBe(dark.text);
    expect(cs('np-in').color).not.toBe(cs('np-out').color);
    expect(cs('np').backgroundColor).toBe(dark['surface-page']);
    expect(cs('np2').backgroundColor).toBe('rgb(1, 2, 3)');
  });

  test('printing: a data-mode="dark" page prints its light colors; a flat dark theme keeps its backgrounds', async () => {
    axes('blue', 'dark');
    const screen = read(root);
    await commands.printMedia(true);
    try {
      axes('blue', 'dark');
      expect(getComputedStyle(root).colorScheme).toBe('light');
      expect(read(root).text).not.toBe(screen.text);
      axes();
      // Chrome before 136 has only the prefixed property, which the CSS sets too.
      const exact = (e: Element) => { const c = getComputedStyle(e) as CSSStyleDeclaration & { webkitPrintColorAdjust?: string }; return c.printColorAdjust ?? c.webkitPrintColorAdjust; };
      // A button on a light page keeps its fill on paper in every supported browser.
      await render(<Button>Print me</Button>);
      expect(exact(page.getByRole('button', { name: 'Print me' }).element())).toBe('exact');
      root.setAttribute('data-theme', 'blue-dark');
      expect([getComputedStyle(root).colorScheme, exact(document.body)]).toEqual(['dark', 'exact']);
    } finally { await commands.printMedia(false); }
  });

  test('printing: data-print="hide" leaves out what is only for the screen, even over a display utility, and only on paper', async () => {
    await render(<><div data-print="hide" className="flex" id="ph"><Button>Pay</Button></div><p id="pk">Kept</p></>);
    const shown = (id: string) => getComputedStyle(document.getElementById(id)!).display;
    expect([shown('ph'), shown('pk')]).toEqual(['flex', 'block']);
    await commands.printMedia(true);
    try {
      expect([shown('ph'), shown('pk')]).toEqual(['none', 'block']);
    } finally { await commands.printMedia(false); }
  });

});
