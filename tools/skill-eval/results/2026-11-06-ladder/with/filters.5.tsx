import { useState } from 'react';
import { Field, Select, SearchInput, Slider, Stack, Switch, Text } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'] as const;
const PRICE_MIN = 0;
const PRICE_MAX = 500;

const formatPrice = (n: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export function ProductSearchBar() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  return (
    <form role="search" aria-label="Products" onSubmit={(e) => e.preventDefault()}>
      <Stack gap={4}>
        <Field label="Search products">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder="Name, author, artist or title"
          />
        </Field>

        <Stack direction="row" gap={4} align="end" wrap>
          <Field label="Category">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Switch
            label="In stock only"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
        </Stack>

        <Field label="Price range" hint={`${formatPrice(price[0])} to ${formatPrice(price[1])}`}>
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={5}
            value={price}
            onChange={(v: number[]) => setPrice([v[0], v[1]])}
          />
        </Field>

        <Text className="text-text-muted" aria-live="polite">
          {category === 'All' ? 'All categories' : category}
          {inStockOnly ? ', in stock only' : ''}, {formatPrice(price[0])} to {formatPrice(price[1])}
        </Text>
      </Stack>
    </form>
  );
}
