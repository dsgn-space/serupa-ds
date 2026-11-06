import { useState } from 'react';
import { Field, Select, SearchInput, Slider, Stack, Switch } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'] as const;
type Category = (typeof CATEGORIES)[number];

export type ProductSearchValue = {
  query: string;
  category: Category;
  inStockOnly: boolean;
  price: [number, number];
};

const PRICE_MIN = 0;
const PRICE_MAX = 500;

export function ProductSearchBar({
  onChange,
}: {
  onChange?: (value: ProductSearchValue) => void;
}) {
  const [value, setValue] = useState<ProductSearchValue>({
    query: '',
    category: 'All',
    inStockOnly: false,
    price: [PRICE_MIN, PRICE_MAX],
  });

  const update = (patch: Partial<ProductSearchValue>) => {
    const next = { ...value, ...patch };
    setValue(next);
    onChange?.(next);
  };

  const [low, high] = value.price;

  return (
    <form role="search" aria-label="Products" onSubmit={(e) => e.preventDefault()}>
      <Stack gap={4}>
        <Field label="Search products">
          <SearchInput
            value={value.query}
            onChange={(e) => update({ query: e.target.value })}
            placeholder="Search by name or keyword"
          />
        </Field>

        <Stack direction="row" gap={4} className="flex-wrap items-end">
          <Field label="Category">
            <Select
              value={value.category}
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
            checked={value.inStockOnly}
            onChange={(e) => update({ inStockOnly: e.target.checked })}
          />
        </Stack>

        <Field label={`Price: $${low} to $${high}`}>
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={5}
            value={value.price}
            onChange={(v: number[]) => update({ price: [v[0], v[1]] })}
          />
        </Field>
      </Stack>
    </form>
  );
}
