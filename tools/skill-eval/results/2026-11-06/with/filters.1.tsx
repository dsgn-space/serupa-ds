import { useId, useState } from 'react';
import { Field, SearchInput, Select, Slider, Stack, Switch, Text } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'] as const;
type Category = (typeof CATEGORIES)[number];

const PRICE_MIN = 0;
const PRICE_MAX = 500;

export interface ProductFilters {
  query: string;
  category: Category;
  inStockOnly: boolean;
  priceRange: [number, number];
}

export interface ProductSearchBarProps {
  onChange?: (filters: ProductFilters) => void;
}

export function ProductSearchBar({ onChange }: ProductSearchBarProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    query: '',
    category: 'All',
    inStockOnly: false,
    priceRange: [PRICE_MIN, PRICE_MAX],
  });
  const priceTextId = useId();

  const update = (patch: Partial<ProductFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onChange?.(next);
  };

  const [low, high] = filters.priceRange;

  return (
    <form
      role="search"
      aria-label="Products"
      className="p-4 bg-surface border rounded-md"
      onSubmit={(e) => e.preventDefault()}
    >
      <Stack gap={4}>
        <Field label="Search products">
          <SearchInput
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
            placeholder="Search by name or keyword"
          />
        </Field>

        <Stack direction="row" gap={4} wrap align="end">
          <Field label="Category">
            <Select
              value={filters.category}
              onChange={(e) => update({ category: e.target.value as Category })}
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
            checked={filters.inStockOnly}
            onChange={(e) => update({ inStockOnly: e.target.checked })}
          />
        </Stack>

        <Field label="Price range" hint={`$${low} to $${high}`}>
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={5}
            value={filters.priceRange}
            onChange={(value: number[]) => update({ priceRange: [value[0], value[1]] })}
            aria-describedby={priceTextId}
          />
        </Field>
        <Text id={priceTextId} className="text-text-muted" size="sm">
          Showing prices from ${low} to ${high}
        </Text>
      </Stack>
    </form>
  );
}
