// The site's theme controls: the brand and light or dark, kept by Serupa's own theme.js (in <head>, see index.html),
// which remembers the choice in this browser and follows the system until one is made.
import * as React from 'react';
import tokens from '../../tokens.json';
import { IconButton } from '../../src/components/IconButton/IconButton';
import { Menu, MenuRadioGroup, MenuRadioItem } from '../../src/components/Menu/Menu';

interface ThemeState { brand: string; mode: 'auto' | 'light' | 'dark'; theme: string }
interface ThemeApi { get: () => ThemeState; set: (next: Partial<Pick<ThemeState, 'brand' | 'mode'>>) => void; onChange: (fn: (s: ThemeState) => void) => () => void }
const api = (): ThemeApi | undefined => (window as unknown as { Serupa?: { theme?: ThemeApi } }).Serupa?.theme;

// The brands come from tokens.json's themes ("<brand>-<mode>"), so a brand added there shows up here.
export const BRANDS = [...new Set(tokens.color.themes.map((t) => t.id.replace(/-(light|dark)$/, '')))];
/** A brand's name as tokens.json's themes give it: "Modern" for emerald. */
export const brandName = (brand: string) => tokens.color.themes.find((t) => t.id === `${brand}-light`)?.name.replace(/ Light$/, '') ?? brand.charAt(0).toUpperCase() + brand.slice(1);

const fallback: ThemeState = { brand: BRANDS[0] ?? 'blue', mode: 'auto', theme: `${BRANDS[0] ?? 'blue'}-light` };
let snapshot = fallback;
const subscribe = (fn: () => void) => api()?.onChange((s) => { snapshot = s; fn(); }) ?? (() => {});
const read = () => { const now = api()?.get(); if (now && (now.theme !== snapshot.theme || now.mode !== snapshot.mode || now.brand !== snapshot.brand)) snapshot = now; return snapshot; };

/** The page's theme, and a way to change it. */
export function useTheme(): ThemeState & { set: ThemeApi['set'] } {
  const state = React.useSyncExternalStore(subscribe, read, () => fallback);
  return { ...state, set: (next) => api()?.set(next) };
}

/** The brand menu and the light or dark switch, for the top bar. */
export function ThemeControls() {
  const { brand, theme, set } = useTheme();
  const dark = theme.endsWith('-dark');
  return <>
    <Menu placement="bottom-end" trigger={<IconButton icon="palette" label={`Brand: ${brandName(brand)}`} variant="ghost" />}>
      <MenuRadioGroup label="Brand" value={brand} onValueChange={(b: string) => set({ brand: b })}>
        {BRANDS.map((b) => <MenuRadioItem key={b} value={b}>{brandName(b)}</MenuRadioItem>)}
      </MenuRadioGroup>
    </Menu>
    <IconButton icon={dark ? 'light_mode' : 'dark_mode'} label={dark ? 'Switch to the light theme' : 'Switch to the dark theme'} variant="ghost" onClick={() => set({ mode: dark ? 'light' : 'dark' })} />
  </>;
}
