// The stories, as the site shows them: each .stories.tsx file says what it holds as it loads (the Vite plugin adds
// the call), and a story draws the way Storybook draws it: its args over the file's, its render or the component,
// inside its decorators and then the file's.
import * as React from 'react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary/ErrorBoundary';

type Args = Record<string, unknown>;
type Ctx = { args: Args; globals: Args; parameters: Args; viewMode: 'docs' };
type Decorator = (Story: React.ComponentType, ctx: Ctx) => React.ReactNode;
export interface Story { name?: string; args?: Args; render?: (args: Args, ctx: Ctx) => React.ReactNode; decorators?: Decorator[]; parameters?: Args; tags?: string[] }
export interface Meta extends Story { component?: React.ComponentType<Args>; title?: string }

export interface StoryEntry {
  /** The stories file, from the repository's root. */
  file: string;
  meta: Meta;
  exportName: string;
  /** The name Storybook shows: the story's own, or its export name in words ("AsLink" is "As Link"). */
  name: string;
  /** Storybook's id for it: "components-actions-button--as-link". */
  id: string;
  /** The last part of the id, which is the story's heading id on a page: "as-link". */
  slug: string;
  /** The story object the file exports, as the docs hand it to <Canvas of={…} />. */
  moduleExport: Story;
  /** The doc comment above the story in its file: what the example shows. */
  description: string;
}

const byFile = new Map<string, StoryEntry[]>();
const byStory = new WeakMap<object, StoryEntry>();
const idOf = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const slugOf = (exportName: string) => exportName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
const words = (exportName: string) => exportName.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2').replace(/_/g, ' ');

/** Called by each stories file as it loads (tools/site/vite.config.mjs adds the call). */
export function registerStories(file: string, meta: Meta, list: Array<[string, Story | undefined, string]>): void {
  const entries: StoryEntry[] = [];
  for (const [exportName, story, description] of list) {
    if (!story || typeof story !== 'object') continue;
    const slug = slugOf(exportName);
    const entry = { file, meta, exportName, name: story.name ?? words(exportName), id: `${idOf(meta.title ?? file)}--${slug}`, slug, moduleExport: story, description };
    entries.push(entry);
    byStory.set(story, entry);
  }
  byFile.set(file, entries);
}
/** A stories file's stories, in the order it exports them. */
export const storiesOf = (file: string | null | undefined): StoryEntry[] => (file && byFile.get(file)) || [];
/** The entry of a story object, for a doc block that was handed one. */
export const entryOf = (story: unknown): StoryEntry | undefined => (story && typeof story === 'object' ? byStory.get(story) : undefined);
/** A story's or its file's parameter, the story's first: layout, docs. */
export const parameter = (entry: StoryEntry, name: string): unknown => entry.moduleExport.parameters?.[name] ?? entry.meta.parameters?.[name];

function Drawn({ entry }: { entry: StoryEntry }) {
  const { meta, moduleExport: story } = entry;
  const args = { ...meta.args, ...story.args };
  const ctx: Ctx = { args, globals: {}, parameters: { ...meta.parameters, ...story.parameters }, viewMode: 'docs' };
  const render = story.render || meta.render;
  const Component = meta.component;
  let Inner: React.ComponentType = () => (render ? render(args, ctx) : Component ? <Component {...args} /> : null);
  for (const d of [...(story.decorators || []), ...(meta.decorators || [])]) {
    const Wrapped: React.ComponentType = Inner;
    Inner = (): React.ReactNode => d(Wrapped, ctx);
  }
  return <Inner />;
}

/** One story, live. A story that throws shows the error in its place, and the rest of the page stays. */
export function StoryView({ entry }: { entry: StoryEntry }) {
  // The element is made once per story: decorators build new component types, which would remount on every render.
  const ui = React.useMemo(() => <Drawn entry={entry} />, [entry]);
  return <ErrorBoundary className="site-broken" title={`${entry.name} couldn’t be shown`}>{ui}</ErrorBoundary>;
}

const modules = import.meta.glob(['../../src/**/*.stories.tsx']);
/** A stories file's stories, once the file has loaded: for a page that shows stories no .mdx page brought with it. */
export async function loadStories(file: string): Promise<StoryEntry[]> {
  await modules[`../../${file}`]?.();
  return storiesOf(file);
}

const sources = import.meta.glob<string>(['../../src/**/*.stories.tsx'], { query: '?raw', import: 'default' });
/** A story's code as its file has it: fetched when someone asks to see it. */
export async function sourceOf(entry: StoryEntry): Promise<string> {
  const text = await sources[`../../${entry.file}`]?.() ?? '';
  const at = new RegExp(`^export const ${entry.exportName}\\b`, 'm').exec(text);
  if (!at) return '';
  const rest = text.slice(at.index);
  const end = rest.slice(1).search(/^(?:export |\/\*\*|\/\/ |const |function |type |interface )/m);
  return (end < 0 ? rest : rest.slice(0, end + 1)).trimEnd();
}
