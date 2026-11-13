/// <reference types="vite/client" />
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { inject } from 'vitest';

// Every story file, and each story as Storybook draws it, for the hydration check (F3): the browser test hydrates
// what serverStories.ts renders in Node.
type Args = Record<string, unknown>;
type Ctx = { args: Args; globals: Args; parameters: Args; viewMode: 'story' };
type Decorator = (Story: React.ComponentType, ctx: Ctx) => React.ReactNode;
type Story = { args?: Args; render?: (args: Args, ctx: Ctx) => React.ReactNode; decorators?: Decorator[]; tags?: string[] };
type Meta = Story & { component?: React.ComponentType<Args>; title?: string };

// ErrorBoundary's stories throw on purpose to show the fallback, and React's server render has no error boundaries:
// the throw ends renderToString, so there is no server HTML to hydrate.
// tools/test/run.mjs leaves the story-wide tests out of a pull request's run that covers only these.
const SKIP = new Set(['ErrorBoundary']);
// The same for one story of a block or pattern: ErrorPages' FromErrorBoundary throws inside an ErrorBoundary on purpose.
const SKIP_STORY = new Set(['ErrorPages/FromErrorBoundary']);
export type { Args, Meta, Story };
export const files = import.meta.glob<Record<string, Meta | Story>>('../../../src/components/*/*.stories.tsx', { eager: true });

// The story as Storybook draws it: its args over the file's, its render (or the component), inside its decorators
// and then the file's.
// With args, those instead of the story's (the prop fuzzing, src/internal/propFuzz.test.tsx).
export function storyElement(meta: Meta, story: Story, args: Args = { ...meta.args, ...story.args }): React.ReactElement {
  const ctx: Ctx = { args, globals: {}, parameters: {}, viewMode: 'story' };
  const render = story.render || meta.render;
  const Component = meta.component;
  let Inner: React.ComponentType = () => (render ? render(args, ctx) : Component ? <Component {...args} /> : null);
  for (const d of [...(story.decorators || []), ...(meta.decorators || [])]) {
    const Wrapped: React.ComponentType = Inner;
    Inner = (): React.ReactNode => d(Wrapped, ctx);
  }
  return <Inner />;
}

// The blocks' and patterns' stories: the hydration checks (plain and under a strict policy) render them too, since a
// block's server HTML hydrates like a component's (ProductGrid's div inside a p reached main, #1806). The other
// story-wide tests keep to the components, whose baselines and budgets they hold.
export const partFiles = import.meta.glob<Record<string, Meta | Story>>(['../../../src/blocks/*/*.stories.tsx', '../../../src/patterns/*/*.stories.tsx'], { eager: true });

// Component name, then each story's export name and element.
const listOf = (all: typeof files): Array<[string, Array<[string, React.ReactElement]>]> => Object.entries(all)
  .map(([file, mod]) => [file.split('/').at(-2)!, mod] as const)
  .filter(([name]) => !SKIP.has(name))
  .map(([name, mod]) => [name, Object.entries(mod)
    .filter(([exportName, story]) => exportName !== 'default' && !!story && typeof story === 'object' && !SKIP_STORY.has(`${name}/${exportName}`))
    .map(([exportName, story]) => [exportName, storyElement((mod.default || {}) as Meta, story)] as [string, React.ReactElement])]);
export const stories = listOf(files);
export const parts = listOf(partFiles);

// The components a pull request's run covers (SERUPA_ONLY, set by run.mjs --since), or every one on a full run.
const covered = (list: typeof stories): typeof stories => {
  const only = inject('only');
  return only === null ? list : list.filter(([n]) => only.split(',').includes(n));
};
export function storiesToRun(): typeof stories {
  return covered(stories);
}
// Stories whose server HTML is known not to hydrate yet, each with its reason, until their lane fixes them. Dashboard
// formats its storage with the browser's own locale (toLocaleString(undefined), Dashboard.tsx), so a server in English
// and a browser in another language disagree (found 13 Nov 2026 when the patterns joined these checks).
export const HYDRATION_KNOWN = new Set(['Dashboard/Default']);

// The same with the blocks and patterns, for the hydration checks.
export function hydrationToRun(): typeof stories {
  return covered([...stories, ...parts]);
}

// Every story's server HTML by "<Component>/<Story>" (blocks and patterns too), or "Error: …" when the server render
// throws.
export function renderAll(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, list] of [...stories, ...parts]) for (const [exportName, ui] of list) {
    try { out[`${name}/${exportName}`] = renderToString(ui); } catch (e) { out[`${name}/${exportName}`] = 'Error: ' + String((e as Error)?.message ?? e); }
  }
  return out;
}

// A component's stories' server HTML as its baseline file (tools/test/baseline-server/<Component>.html, E4): each
// story under a comment with its name, sorted by name (Node and the browser list a module's exports in different
// orders), one tag per line so a change reads as a diff of a few lines.
export function serverBaseline(name: string, html: Record<string, string>): string {
  const list = (stories.find(([n]) => n === name)?.[1] || []).map(([n]) => n).sort();
  return list.map((exportName) => `<!-- ${exportName} -->\n${(html[`${name}/${exportName}`] ?? '').replace(/></g, '>\n<')}\n`).join('\n');
}

// What serverStories.ts hands the browser tests (inject('serverStories')).
declare module 'vitest' {
  export interface ProvidedContext { serverStories: Record<string, string>; only: string | null; bench: boolean; coverage: boolean }
}
