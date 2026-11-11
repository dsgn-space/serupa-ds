import { useEffect, useState } from 'react';
import { Card, Container, Field, Heading, SearchInput, SegmentedControl, Select, SkipLink, Slider, Stack, Switch, Text } from 'serupa-ds';
import type { ThemeMode } from 'serupa-ds';

// theme.js (first in <head>) follows the visitor's light or dark setting and remembers a choice made here.
function ThemeSwitch() {
  const [mode, setMode] = useState<ThemeMode>(() => window.Serupa?.theme?.get().mode ?? 'auto');
  useEffect(() => window.Serupa?.theme?.onChange((info) => setMode(info.mode)), []);
  return (
    <SegmentedControl
      aria-label="Theme"
      value={mode}
      onValueChange={(value) => window.Serupa?.theme?.set({ mode: value as ThemeMode })}
      options={[{ value: 'auto', label: 'Auto' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
    />
  );
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'books', label: 'Books' },
  { value: 'music', label: 'Music' },
  { value: 'games', label: 'Games' },
];

const PRICE_MIN = 0;
const PRICE_MAX = 200;
const formatPrice = (value: number) => `$${value}`;

function ProductSearchBar() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  return (
    <Card>
      <form role="search" aria-label="Products" onSubmit={(e) => e.preventDefault()}>
        <Stack gap={4}>
          <Field label="Search products">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              placeholder="Title, author or artist"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} />
            </Field>
            <Field label={`Price range: ${formatPrice(price[0])} to ${formatPrice(price[1])}`}>
              <Slider
                value={price}
                onValueChange={setPrice}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={5}
                formatValue={formatPrice}
                thumbLabels={['Minimum price', 'Maximum price']}
                showValue
              />
            </Field>
          </div>
          <Switch checked={inStockOnly} onCheckedChange={setInStockOnly}>In stock only</Switch>
        </Stack>
      </form>
    </Card>
  );
}

export function App() {
  return (
    <>
      <SkipLink />
      <Container as="header" className="flex items-center justify-between gap-4 py-4">
        <Text as="span" weight="semibold">Eval app</Text>
        <ThemeSwitch />
      </Container>
      <Container as="main" id="main" size="prose" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Products</Heading>
          <ProductSearchBar />
        </Stack>
      </Container>
    </>
  );
}
