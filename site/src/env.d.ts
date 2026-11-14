/// <reference types="vite/client" />
declare const __VERSION__: string;

declare module '*.mdx' {
  import type * as React from 'react';
  const Page: React.ComponentType<{ components?: Record<string, React.ElementType> }>;
  export default Page;
}

declare module 'virtual:site-pages' {
  const pages: import('./pages').Page[];
  export default pages;
}

declare module 'virtual:site-props' {
  const props: Record<string, () => Promise<{ default: import('./pages').ComponentDoc[] }>>;
  export default props;
}
