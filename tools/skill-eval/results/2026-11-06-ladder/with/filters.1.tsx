import { useState } from 'react';
import { Card, Field, FormattedNumber, Select, SearchInput, Slider, Stack, Switch } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'] as const;
type Category = (typeof CATEGORIES)[number];

const PRICE_MIN = 0;
const PRICE_MAX = 500;

export interface ProductSearchValue {
  query: string;
  category: Category;
  inStockOnly: boolean;
  price: [number, number];
}

export function ProductSearchBar({
  onSearch,
}: {
  onSearch?: (value: ProductSearchValue) => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ query, category, inStockOnly, price });
  };

  return (
    <Card as="section" aria-label="Product search" className="p-4">
      <form onSubmit={submit} role="search">
        <Stack gap={4}>
          <Field label="Search products">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
              placeholder="Title, author, artist…"
            />
          </Field>

          <Stack direction="row" gap={4} align="end" wrap>
            <Field label="Category">
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
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

          <Field
            label="Price range"
            hint={
              <>
                <FormattedNumber
                  value={price[0]}
                  style="currency"
                  currency="USD"
                  maximumFractionDigits={0}
                />
                {' to '}
                <FormattedNumber
                  value={price[1]}
                  style="currency"
                  currency="USD"
                  maximumFractionDigits={0}
                />
              </>
            }
          >
            <Slider
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={5}
              value={price}
              onChange={(v: number[]) => setPrice([v[0], v[1]])}
            />
          </Field>
        </Stack>
      </form>
    </Card>
  );
}
