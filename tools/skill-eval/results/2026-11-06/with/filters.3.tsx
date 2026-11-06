import { useState } from 'react';
import { Card, Field, Select, SearchInput, Slider, Stack, Switch, Text } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'] as const;

export function ProductSearchBar() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [price, setPrice] = useState<[number, number]>([0, 200]);

  return (
    <Card as="search" aria-label="Product search" className="p-4">
      <Stack gap={4}>
        <Field label="Search products">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder="Search by name or keyword"
          />
        </Field>

        <Stack direction="row" gap={4} className="flex-wrap items-end">
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="In stock only">
            <Switch checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
          </Field>
        </Stack>

        <Field label="Price range" hint={`$${price[0]} to $${price[1]}`}>
          <Slider
            value={price}
            onValueChange={(v: number[]) => setPrice([v[0], v[1]])}
            min={0}
            max={200}
            step={5}
            aria-label="Price range"
          />
        </Field>

        <Text className="text-text-muted" role="status">
          {category} · {inStockOnly ? 'In stock only' : 'All availability'} · ${price[0]} to ${price[1]}
        </Text>
      </Stack>
    </Card>
  );
}
