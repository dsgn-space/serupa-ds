import { useEffect, useState } from 'react';
import { Button, Card, Container, Field, Heading, SearchInput, SegmentedControl, Select, SkipLink, Slider, Stack, Switch, Text, announce } from 'serupa-ds';
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
const PRICE_MIN = 0;
const PRICE_MAX = 500;
const formatPrice = (value: number) => `$${value}`;

export function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [inStock, setInStock] = useState(false);
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  const reset = () => {
    setQuery('');
    setCategory('All');
    setInStock(false);
    setPrice([PRICE_MIN, PRICE_MAX]);
    announce('Filters cleared');
  };

  return (
    <>
      <SkipLink />
      <Container as="header" className="flex items-center justify-between gap-4 py-4">
        <Text as="span" weight="semibold">Eval app</Text>
        <ThemeSwitch />
      </Container>
      <Container as="main" id="main" size="prose" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Search products</Heading>
          <Card>
            <form
              role="search"
              aria-label="Products"
              onSubmit={(e) => {
                e.preventDefault();
                announce(`Searching ${category === 'All' ? 'all categories' : category} for ${query || 'everything'}`);
              }}
            >
              <Stack gap={4}>
                <Field label="Search">
                  <SearchInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onClear={() => setQuery('')}
                    placeholder="Name or keyword"
                  />
                </Field>
                <Field label="Category">
                  <Select value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} />
                </Field>
                <Stack gap={2}>
                  <Text as="span" weight="medium" id="price-label">
                    Price range: {formatPrice(price[0])} to {formatPrice(price[1])}
                  </Text>
                  <Slider
                    aria-labelledby="price-label"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={5}
                    value={price}
                    onValueChange={setPrice}
                    formatValue={formatPrice}
                    thumbLabels={['Minimum price', 'Maximum price']}
                  />
                </Stack>
                <Switch checked={inStock} onCheckedChange={setInStock}>In stock only</Switch>
                <Stack gap={2} className="sm:flex-row">
                  <Button type="submit">Search products</Button>
                  <Button type="button" variant="ghost" onClick={reset}>Clear filters</Button>
                </Stack>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
