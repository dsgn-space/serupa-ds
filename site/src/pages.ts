// The site's pages and its navigation, from the list tools/site/pages.mjs makes of Storybook's .mdx pages.
import type * as React from 'react';
import list from 'virtual:site-pages';
import propsOf from 'virtual:site-props';
import SECTIONS from './sections.json';

export interface Page {
  /** The .mdx file, from the repository's root. */
  file: string;
  /** Its Storybook title: "Components/Actions/Button". */
  title: string;
  /** Its Storybook id, without "--docs". */
  id: string;
  /** Its address on the site: "/components/button". */
  path: string;
  section: string;
  /** A component's group ("Actions"), or "". */
  group: string;
  name: string;
  /** The first sentence of its guide, for a component, block or pattern. */
  summary: string;
  status: 'alpha' | 'beta' | 'stable' | 'deprecated';
  /** Its stories file, when its <Meta /> names one. */
  stories: string | null;
  /** The component folder it documents, for a page under src/components/. */
  component: string | null;
}
export interface PropDoc { name: string; type: string; required: boolean; default: string | null; description: string; deprecated: string | null }
export interface ComponentDoc { name: string; description: string; props: PropDoc[] }

export const pages: Page[] = list;
const byPath = new Map(pages.map((p) => [p.path, p]));
const byId = new Map(pages.map((p) => [p.id, p]));
export const pageAt = (path: string): Page | undefined => byPath.get(path);
/** The page for a Storybook id ("components-actions-button"), as the docs' own links name them. */
export const pageForStorybook = (id: string): Page | undefined => byId.get(id)
  // A link written without the component's group ("components-stepper") still finds it by name.
  ?? pages.find((p) => p.section === 'Components' && `components-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '')}` === id);
/** The page of a component, block or pattern by its folder's name, as the guides link to each other. */

type MdxModule = { default: React.ComponentType<{ components?: Record<string, React.ElementType> }> };
const loaders = import.meta.glob<MdxModule>(['../../docs/**/*.mdx', '../../src/**/*.mdx']);
/** Loads a page's content: the same .mdx file Storybook shows. */
export const loadPage = (page: Page): Promise<MdxModule> => {
  const load = loaders[`../../${page.file}`];
  return load ? load() : Promise.reject(new Error(`${page.file} is not one of the site's pages`));
};
/** Loads a component's props, as read from its types. */
export const loadProps = (component: string): Promise<ComponentDoc[]> => propsOf[component]?.().then((m) => m.default) ?? Promise.resolve([]);

const az = (a: Page, b: Page) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
const inSection = (section: string) => pages.filter((p) => p.section === section);
// The reading order Storybook's sidebar gives the Foundations pages (.storybook/preview.tsx); the rest follow A to Z.
const FOUNDATIONS = ['Design principles', 'Colors', 'Themes', 'Theme playground', 'Typography', 'Spacing', 'Layout', 'Corner radius', 'Effects and borders', 'Elevation and layers', 'Motion',
  'Content and voice', 'Data formats', 'Ethical design', 'Accessibility', 'Utility classes', 'Icons'];
const ordered = (list: Page[], order: string[]) => [...list].sort((a, b) => {
  const i = order.indexOf(a.name), j = order.indexOf(b.name);
  return (i < 0 ? order.length : i) - (j < 0 ? order.length : j) || az(a, b);
});

export interface NavGroup { title: string; pages: Page[] }
export interface NavSection {
  id: string;
  label: string;
  /** Where the top bar's link goes. */
  path: string;
  /** What its index page says under the title; a section without one has no index page. */
  lead?: string;
  groups: NavGroup[];
}

const START = ['Introduction', 'Getting started', 'Versioning and tools', 'Upgrading', 'Changelog', 'Accessibility statement'];
const components = inSection('Components');
// The sections' names, addresses and leads are in sections.json, which the build reads too for each index page's
// description (tools/site/head.mjs).
const lead = (id: string) => SECTIONS.find((s) => s.id === id)?.lead?.replace('{count}', String(components.filter((p) => p.component).length));
const GROUPS: Record<string, NavGroup[]> = {
  start: [{ title: '', pages: ordered(pages.filter((p) => START.includes(p.title)), START) }],
  foundations: [{ title: '', pages: ordered(inSection('Foundations'), FOUNDATIONS) }],
  components: [...new Set(components.map((p) => p.group))].sort().map((g) => ({ title: g, pages: components.filter((p) => p.group === g).sort(az) })),
  patterns: [{ title: '', pages: ordered(inSection('Patterns'), ['Introduction']) }],
  blocks: [{ title: '', pages: ordered(inSection('Blocks'), ['Introduction']) }],
  guides: [{ title: '', pages: inSection('Guides').sort(az) }],
};
export const sections: NavSection[] = SECTIONS.map((s) => ({ id: s.id, label: s.label, path: s.path, lead: lead(s.id), groups: GROUPS[s.id] ?? [] }));
/** The section a path belongs to: a page's, or a section's own index. */
export const sectionOf = (path: string): NavSection | undefined => sections.find((s) => s.path === path || s.groups.some((g) => g.pages.some((p) => p.path === path)));
/** A section's pages in reading order, for "previous" and "next". */
export const pagesOf = (s: NavSection): Page[] => s.groups.flatMap((g) => g.pages);
