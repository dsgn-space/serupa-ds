import { useState } from 'react';
import { Card, Field, FormattedNumber, SearchInput, Select, Slider, Stack, Switch, Text } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'] as const;
type Category = (typeof CATEGORIES)[number];

const PRICE_MIN = 0;
const PRICE_MAX = 500;

export function ProductSearchBar() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  return (
    <Card as="search" aria-label="Product search" className="p-4">
      <Stack gap={4}>
        <Field label="Search products">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder="Title, artist or author"
          />
        </Field>

        <Stack direction="row" gap={4} wrap align="end">
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Switch checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)}>
            In stock only
          </Switch>
        </Stack>

        <Field
          label="Price range"
          hint={
            <Text as="span" className="text-text-muted">
              <FormattedNumber value={price[0]} style="currency" currency="USD" maximumFractionDigits={0} />
              {' – '}
              <FormattedNumber value={price[1]} style="currency" currency="USD" maximumFractionDigits={0} />
            </Text>
          }
        >
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={5}
            value={price}
            onChange={(v: [number, number]) => setPrice(v)}
          />
        </Field>
      </Stack>
    </Card>
  );
}
