import { useState } from 'react';
import type { FormEvent } from 'react';
import { Card, Field, FormattedNumber, Grid, SearchInput, Select, Slider, Stack, Switch } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'] as const;
type Category = (typeof CATEGORIES)[number];

const PRICE_MIN = 0;
const PRICE_MAX = 500;

export interface ProductSearchValues {
  query: string;
  category: Category;
  inStockOnly: boolean;
  priceRange: [number, number];
}

export interface ProductSearchBarProps {
  onSearch?: (values: ProductSearchValues) => void;
}

export function ProductSearchBar({ onSearch }: ProductSearchBarProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch?.({ query, category, inStockOnly, priceRange });
  };

  return (
    <Card>
      <form role="search" aria-label="Products" onSubmit={submit}>
        <Stack gap={4}>
          <Field label="Search products">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              placeholder="Title, author, artist…"
            />
          </Field>

          <Grid minColumnWidth="14rem" gap={4}>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Price range"
              hint={
                <>
                  <FormattedNumber value={priceRange[0]} style="currency" currency="USD" maximumFractionDigits={0} />
                  {' – '}
                  <FormattedNumber value={priceRange[1]} style="currency" currency="USD" maximumFractionDigits={0} />
                </>
              }
            >
              <Slider
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={5}
                value={priceRange}
                onChange={(v: number[]) => setPriceRange([v[0], v[1]])}
              />
            </Field>

            <Switch checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} label="In stock only" />
          </Grid>
        </Stack>
      </form>
    </Card>
  );
}
