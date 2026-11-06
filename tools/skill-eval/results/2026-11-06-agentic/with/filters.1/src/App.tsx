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

const CATEGORIES = ['All', 'Books', 'Music', 'Games'];
const MAX_PRICE = 200;
const money = (n: number) => `$${n}`;

function ProductSearchBar() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [inStock, setInStock] = useState(false);
  const [price, setPrice] = useState<[number, number]>([0, MAX_PRICE]);

  return (
    <Card>
      <form role="search" aria-label="Products" onSubmit={(e) => e.preventDefault()}>
        <Stack gap={4}>
          <Field label="Search products">
            <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" />
          </Field>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} />
          </Field>
          <Field label="Price range" hint={`${money(price[0])} to ${money(price[1])}`}>
            <Slider
              value={price}
              onValueChange={setPrice}
              min={0}
              max={MAX_PRICE}
              step={5}
              formatValue={money}
              thumbLabels={['Minimum price', 'Maximum price']}
            />
          </Field>
          <Switch checked={inStock} onCheckedChange={setInStock}>In stock only</Switch>
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
