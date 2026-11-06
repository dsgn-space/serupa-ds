import { useState } from 'react';
import { Field, Select, SearchInput, Slider, Stack, Switch, Text } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'] as const;
type Category = (typeof CATEGORIES)[number];

const PRICE_MIN = 0;
const PRICE_MAX = 500;

export interface ProductSearchFilters {
  query: string;
  category: Category;
  inStockOnly: boolean;
  priceRange: [number, number];
}

interface ProductSearchBarProps {
  onSearch?: (filters: ProductSearchFilters) => void;
}

export function ProductSearchBar({ onSearch }: ProductSearchBarProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  const submit = (next?: Partial<ProductSearchFilters>) =>
    onSearch?.({ query, category, inStockOnly, priceRange, ...next });

  return (
    <form
      role="search"
      aria-label="Products"
      className="p-4 bg-surface border rounded-md"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Stack gap={4}>
        <Field label="Search products">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => {
              setQuery('');
              submit({ query: '' });
            }}
            placeholder="Title, artist or author"
          />
        </Field>

        <Stack direction="row" gap={4} align="end" wrap>
          <Field label="Category">
            <Select
              value={category}
              onChange={(e) => {
                const next = e.target.value as Category;
                setCategory(next);
                submit({ category: next });
              }}
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
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              submit({ inStockOnly: e.target.checked });
            }}
          />
        </Stack>

        <Field label="Price range" hint={`$${priceRange[0]} to $${priceRange[1]}`}>
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={10}
            value={priceRange}
            onChange={(value: number[]) => setPriceRange([value[0], value[1]])}
            onChangeEnd={(value: number[]) => submit({ priceRange: [value[0], value[1]] })}
          />
        </Field>

        <Text className="text-text-muted">
          Showing {category === 'All' ? 'all categories' : category}
          {inStockOnly ? ', in stock only' : ''}.
        </Text>
      </Stack>
    </form>
  );
}
