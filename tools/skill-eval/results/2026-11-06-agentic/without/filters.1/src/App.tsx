import { useEffect, useId, useState } from 'react';
import { Card, Container, Field, Heading, SearchInput, SegmentedControl, Select, SkipLink, Slider, Stack, Switch, Text } from 'serupa-ds';
import type { ThemeMode } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'];
const PRICE_MIN = 0;
const PRICE_MAX = 200;

const formatPrice = (value: number) => `$${value}`;

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

function ProductSearchBar() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const priceLabelId = useId();

  return (
    <Card>
      <form role="search" aria-label="Products" onSubmit={(e) => e.preventDefault()}>
        <Stack gap={4}>
          <Field label="Search products">
            <SearchInput
              size="lg"
              placeholder="Title, author, artist or studio"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr] lg:items-end">
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} />
            </Field>
            <Switch checked={inStockOnly} onCheckedChange={setInStockOnly} className="lg:pb-1">
              In stock only
            </Switch>
            <Stack gap={2} className="sm:col-span-2 lg:col-span-1">
              <Text as="span" id={priceLabelId} size="sm" weight="medium">
                Price: {formatPrice(price[0])} to {formatPrice(price[1])}
                {price[1] === PRICE_MAX ? '+' : ''}
              </Text>
              <Slider
                aria-labelledby={priceLabelId}
                thumbLabels={['Minimum price', 'Maximum price']}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={5}
                value={price}
                onValueChange={setPrice}
                formatValue={formatPrice}
              />
            </Stack>
          </div>
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
      <Container as="main" id="main" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Products</Heading>
          <ProductSearchBar />
        </Stack>
      </Container>
    </>
  );
}
