import * as React from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';
import { addons } from 'storybook/internal/preview-api';
import '../tokens.css';
import '../src/styles/base.css';
import '../src/styles/index.css';
import './docs.css';

// The toolbar picks a brand and a mode; together they are the page's data-theme, as theme.js sets it.
// Docs pages without stories (Foundations, Introduction) run no decorator, so the globals are also followed
// straight from the channel; the theme then paints the whole page (see docs.css).
const apply = (g: Record<string, unknown> | undefined) => {
  if (!g) return;
  document.documentElement.setAttribute('data-theme', `${g.brand || 'blue'}-${g.mode || 'light'}`);
};
const channel = addons.getChannel();
channel.on('setGlobals', (e: { globals?: Record<string, unknown> }) => apply(e.globals));   // already merged, with a story's own globals on top
channel.on('globalsUpdated', (e: { globals?: Record<string, unknown> }) => apply(e.globals));

const WithTheme: Decorator = (Story, context) => {
  const theme = `${context.globals.brand || 'blue'}-${context.globals.mode || 'light'}`;
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return <Story />;
};

const preview: Preview = {
  globalTypes: {
    brand: {
      description: 'Brand',
      toolbar: { title: 'Brand', icon: 'paintbrush', dynamicTitle: true, items: [
        { value: 'blue', title: 'Blue' }, { value: 'violet', title: 'Violet' }, { value: 'emerald', title: 'Emerald' }] },
    },
    mode: {
      description: 'Light or dark',
      toolbar: { title: 'Mode', icon: 'contrast', dynamicTitle: true, items: [
        { value: 'light', title: 'Light', icon: 'sun' }, { value: 'dark', title: 'Dark', icon: 'moon' }] },
    },
  },
  initialGlobals: { brand: 'blue', mode: 'light' },
  decorators: [WithTheme],
  parameters: {
    layout: 'padded',
    controls: { expanded: true, sort: 'requiredFirst' },
    backgrounds: { disabled: true },   // the theme sets the page background (surface)
    a11y: { context: '#storybook-root' },
    // The docs pages and the Foundations pages keep their reading order; the component groups and the
    // components in them go A-Z. Stories in one component keep the order of their file. Storybook turns this
    // function into a string and runs it on its own, so it can't use anything from outside it or TypeScript types.
    options: {
      storySort: (a, b) => {
        const order = ['Introduction', 'Getting started', 'Foundations', 'Components', 'Versioning and tools', 'Changelog'];
        const foundations = ['Colors', 'Themes', 'Typography', 'Spacing', 'Corner radius', 'Effects and borders', 'Motion', 'Utility classes', 'Icons'];
        const at = (list, name) => { const i = list.indexOf(name); return i < 0 ? list.length : i; };
        const x = a.title.split('/'), y = b.title.split('/');
        if (x[0] !== y[0]) return at(order, x[0]) - at(order, y[0]);
        if (x[0] === 'Foundations') return at(foundations, x[1]) - at(foundations, y[1]);
        if (x[0] !== 'Components') return 0;
        for (let i = 1; i < Math.min(x.length, y.length); i++) {
          const c = x[i].localeCompare(y[i], 'en', { sensitivity: 'base' });
          if (c) return c;
        }
        return x.length - y.length;
      },
    },
  },
};
export default preview;
