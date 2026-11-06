import { useState } from 'react';
import { Field, FormattedNumber, SearchInput, Select, Slider, Stack, Switch, Text } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'] as const;
type Category = (typeof CATEGORIES)[number];

const PRICE_MIN = 0;
const PRICE_MAX = 500;

export interface ProductFilters {
  query: string;
  category: Category;
  inStockOnly: boolean;
  price: [number, number];
}

export function ProductSearchBar({ onChange }: { onChange?: (filters: ProductFilters) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  const emit = (next: Partial<ProductFilters>) =>
    onChange?.({ query, category, inStockOnly, price, ...next });

  return (
    <form role="search" aria-label="Products" onSubmit={(e) => e.preventDefault()}>
      <Stack gap={4} className="p-4 bg-surface rounded-md border">
        <Stack direction="row" gap={4} wrap>
          <Field label="Search products" className="flex-1">
            <SearchInput
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                emit({ query: e.target.value });
              }}
              placeholder="Title, author, artist…"
            />
          </Field>

          <Field label="Category">
            <Select
              value={category}
              onChange={(e) => {
                const value = e.target.value as Category;
                setCategory(value);
                emit({ category: value });
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </Stack>

        <Stack direction="row" gap={6} wrap align="end">
          <Switch
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              emit({ inStockOnly: e.target.checked });
            }}
          >
            In stock only
          </Switch>

          <Field label="Price range" className="flex-1">
            <Slider
              range
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={5}
              value={price}
              onChange={(value: number[]) => {
                const next: [number, number] = [value[0], value[1]];
                setPrice(next);
                emit({ price: next });
              }}
            />
            <Text size="sm" className="text-text-muted">
              <FormattedNumber value={price[0]} style="currency" currency="USD" maximumFractionDigits={0} />
              {' – '}
              <FormattedNumber value={price[1]} style="currency" currency="USD" maximumFractionDigits={0} />
            </Text>
          </Field>
        </Stack>
      </Stack>
    </form>
  );
}
