import * as React from 'react';
import type { Decorator, Preview } from '@storybook/react';
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

const withTheme: Decorator = (Story, context) => {
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
  decorators: [withTheme],
  parameters: {
    layout: 'padded',
    controls: { expanded: true, sort: 'requiredFirst' },
    backgrounds: { disable: true },   // the theme sets the page background (surface)
    a11y: { element: '#storybook-root' },
    options: { storySort: { order: ['Introduction', 'Getting started', 'Foundations', ['Colors', 'Themes', 'Typography', 'Spacing', 'Corner radius', 'Effects and borders', 'Motion', 'Utility classes'], 'Components', 'Versioning and tools', 'Changelog'] } },
  },
};
export default preview;
