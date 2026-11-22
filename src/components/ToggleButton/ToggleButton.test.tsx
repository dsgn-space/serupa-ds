import * as React from 'react';
import { beforeAll, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, color, contrast } from '../../../tools/test/vitest/helpers';
import { ButtonGroup } from '../ButtonGroup/ButtonGroup';
import { ToggleButton } from './ToggleButton';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const pressed = (id: string) => el(id).getAttribute('aria-pressed');

// Measured at rest, as the script did: no transitions or animations.
beforeAll(() => {
  const still = document.createElement('style');
  still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
  document.head.appendChild(still);
});

function Formatting({ boldRef }: { boldRef?: React.Ref<HTMLButtonElement> }) {
  return <ButtonGroup id="gfmt" aria-label="Text formatting">
    <ToggleButton id="tbold" icon="format_bold" aria-label="Bold" ref={boldRef} className="extra" />
    <ToggleButton id="titalic" icon="format_italic" aria-label="Italic" defaultPressed />
    <ToggleButton id="tghost" icon="format_underlined" aria-label="Underline" variant="ghost" defaultPressed />
  </ButtonGroup>;
}

describe('ToggleButton', () => {
  test('a button with aria-pressed="false", outline by default, icon-only with aria-label; ref and className reach it', async () => {
    const ref = React.createRef<HTMLButtonElement>();
    await render(<Formatting boldRef={ref} />);
    const e = el('tbold') as HTMLButtonElement;
    expect([e.tagName, e.type, pressed('tbold'), e.getAttribute('aria-label'), e.dataset.component, (e.querySelector<HTMLElement>('[data-icon]'))?.dataset.icon]).toEqual(['BUTTON', 'button', 'false', 'Bold', 'button', 'format_bold']);
    expect(e.className).toMatch(/srp-btn--outline/);
    expect(e.className).toMatch(/srp-toggle-button extra/);
    expect(ref.current).toBe(e);
  });

  test('pressing it turns it on: aria-pressed="true", primary-subtle with primary text and border; hover keeps the pressed colors; Space turns it off again', async () => {
    await render(<Formatting />);
    await userEvent.click(el('tbold'));
    const s = getComputedStyle(el('tbold')), on = [s.backgroundColor, s.color, s.borderTopColor];
    expect(pressed('tbold')).toBe('true');
    expect(on).toEqual([color('var(--primary-subtle)'), color('var(--primary-text)'), color('var(--primary-text)')]);
    await userEvent.hover(el('tbold'));
    expect(getComputedStyle(el('tbold')).backgroundColor).toBe(on[0]);
    el('tbold').focus();
    await userEvent.keyboard(' ');
    expect(pressed('tbold')).toBe('false');
  });

  test('held down, an on toggle steps past its fill (primary-subtle-pressed, primary-hover text at 4.5:1), as every Button variant does, in every theme', async () => {
    await render(<Formatting />);
    const bad: string[] = [];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      for (const id of ['titalic', 'tghost']) {
        const rest = getComputedStyle(el(id)).backgroundColor;
        el(id).setAttribute('data-pressed', '');
        const s = getComputedStyle(el(id));
        if (s.backgroundColor !== color('var(--primary-subtle-pressed)') || s.backgroundColor === rest) bad.push(`${th} ${id} fill ${s.backgroundColor}`);
        if (contrast(s.color, s.backgroundColor) < 4.5) bad.push(`${th} ${id} text ${contrast(s.color, s.backgroundColor).toFixed(2)}`);
        el(id).removeAttribute('data-pressed');
      }
    }
    document.documentElement.removeAttribute('data-theme');
    expect(bad).toEqual([]);
  });

  test('keyboard table: Tab reaches the button; Enter and Space each turn it on or off (FH1)', async () => {
    await render(<div><button id="tb-before">before</button><Formatting /></div>);
    el('tb-before').focus();
    await userEvent.tab();
    const at = document.activeElement?.id, seen: Array<string | null> = [];
    for (const k of ['{Enter}', '{Enter}', ' ', ' ']) { await userEvent.keyboard(k); seen.push(pressed('tbold')); }
    expect([at, seen]).toEqual(['tbold', ['true', 'false', 'true', 'false']]);
  });

  test('defaultPressed starts on; variant="ghost"; an unknown variant falls back to outline', async () => {
    await render(<>
      <Formatting />
      {/* @ts-expect-error: not a ToggleButton variant */}
      <ToggleButton id="tbad" variant="primary">Bad</ToggleButton>
    </>);
    expect([pressed('tghost'), /srp-btn--ghost/.test(el('tghost').className), pressed('titalic')]).toEqual(['true', true, 'true']);
    expect(el('tbad').className).toMatch(/srp-btn--outline/);
  });

  test('controlled: onPressedChange gets the new state, the parent sets it', async () => {
    const calls: boolean[] = [];
    function Controlled() {
      const [on, setOn] = React.useState(true);
      return <ToggleButton id="tctl" pressed={on} onPressedChange={(v) => { calls.push(v); setOn(v); }}>Grid</ToggleButton>;
    }
    await render(<Controlled />);
    await userEvent.click(el('tctl'));
    expect([pressed('tctl'), calls]).toEqual(['false', [false]]);
  });

  test('onClick with preventDefault stops the toggle; disabled doesn\'t toggle', async () => {
    await render(<>
      <ToggleButton id="tprev" onClick={(e) => e.preventDefault()}>Prevented</ToggleButton>
      <ToggleButton id="tdis" disabled>Disabled</ToggleButton>
    </>);
    await userEvent.click(el('tprev'));
    await userEvent.click(el('tdis'), { force: true });
    expect([pressed('tprev'), pressed('tdis')]).toEqual(['false', 'false']);
  });

  test('on and disabled, it is drawn in neutrals in every theme: no primary color, a fill and (outline) a border the off ones lack, and text at 3.4:1 or more (GR418)', async () => {
    await render(<>
      <ToggleButton id="don" disabled defaultPressed>On</ToggleButton>
      <ToggleButton id="doff" disabled>Off</ToggleButton>
      <ToggleButton id="dghost" disabled defaultPressed variant="ghost">Ghost</ToggleButton>
    </>);
    for (const theme of THEMES) {
      document.documentElement.setAttribute('data-theme', theme);
      const on = getComputedStyle(el('don')), off = getComputedStyle(el('doff')), ghost = getComputedStyle(el('dghost'));
      expect([theme, on.backgroundColor, on.color, on.borderTopColor]).toEqual([theme, color('var(--highlight)'), color('var(--text-muted)'), color('var(--border-control)')]);
      expect([theme, on.backgroundColor === off.backgroundColor, on.borderTopColor === off.borderTopColor]).toEqual([theme, false, false]);
      expect(contrast(on.color, on.backgroundColor), theme).toBeGreaterThanOrEqual(3.4);
      expect(contrast(on.borderTopColor, color('var(--surface)')), theme).toBeGreaterThanOrEqual(3);
      expect([theme, ghost.backgroundColor, ghost.color]).toEqual([theme, color('var(--highlight)'), color('var(--text-muted)')]);
    }
    document.documentElement.removeAttribute('data-theme');
  });

  test('tokens: --toggle-button-bg-pressed-disabled, --toggle-button-text-pressed-disabled, --toggle-button-border-pressed-disabled', async () => {
    await render(<ToggleButton id="tdtok" disabled defaultPressed style={{ '--toggle-button-bg-pressed-disabled': 'rgb(1, 2, 3)', '--toggle-button-text-pressed-disabled': 'rgb(4, 5, 6)', '--toggle-button-border-pressed-disabled': 'rgb(7, 8, 9)' } as React.CSSProperties}>Tok</ToggleButton>);
    const s = getComputedStyle(el('tdtok'));
    expect([s.backgroundColor, s.color, s.borderTopColor]).toEqual(['rgb(1, 2, 3)', 'rgb(4, 5, 6)', 'rgb(7, 8, 9)']);
  });

  test('token: --toggle-button-bg-pressed', async () => {
    await render(<ToggleButton id="ttok" defaultPressed style={{ '--toggle-button-bg-pressed': 'rgb(1, 2, 3)' } as React.CSSProperties}>Tok</ToggleButton>);
    expect(getComputedStyle(el('ttok')).backgroundColor).toBe('rgb(1, 2, 3)');
  });

  test('contrast: pressed text 4.5:1 on its background, the pressed border 3:1 on surface, in every theme', async () => {
    await render(<Formatting />);
    const low: string[] = [];
    let n = 0;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const s = getComputedStyle(el('titalic'));
      for (const [name, fg, bg, min] of [['pressed text', s.color, s.backgroundColor, 4.5], ['pressed border on surface', s.borderTopColor, 'var(--surface)', 3]] as const) {
        const r = contrast(fg, bg); n++;
        if (r < min) low.push(`${th} ${name}: ${r.toFixed(2)}`);
      }
    }
    expect([low, n]).toEqual([[], 12]);
  });
});

describe('ToggleButton onMedia', () => {
  test('takes Button\'s onMedia: white over dark media, black over light, in its fill or its text', async () => {
    await render(<div><ToggleButton id="om-dark" icon="format_bold" aria-label="Bold" onMedia="dark" /><ToggleButton id="om-light" icon="format_italic" aria-label="Italic" onMedia="light" /></div>);
    const inks = (id: string) => { const s = getComputedStyle(document.getElementById(id)!); return [s.color, s.backgroundColor]; };
    expect(document.getElementById('om-dark')!.className).toContain('srp-btn--on-dark');
    expect(inks('om-dark')).toContain('rgb(255, 255, 255)');
    expect(document.getElementById('om-light')!.className).toContain('srp-btn--on-light');
    expect(inks('om-light')).toContain('rgb(0, 0, 0)');
  });
});
