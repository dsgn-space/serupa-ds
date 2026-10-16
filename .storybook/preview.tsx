import * as React from 'react';
import type { Decorator, Preview } from '@storybook/react';
import '../tokens.css';
import '../src/styles/base.css';
import '../src/styles/index.css';
import './docs.css';

// The toolbar picks a brand and a mode; together they are the page's data-theme, as theme.js sets it.
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
