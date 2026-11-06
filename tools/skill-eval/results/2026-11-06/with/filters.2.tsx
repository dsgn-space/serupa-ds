import { useState } from 'react';
import { Button, Card, Field, FormattedNumber, Grid, SearchInput, Select, Stack, Switch, Slider, Text } from 'serupa-ds';

const CATEGORIES = ['All', 'Books', 'Music', 'Games'] as const;
type Category = (typeof CATEGORIES)[number];

export interface ProductSearchValues {
  query: string;
  category: Category;
  inStockOnly: boolean;
  priceRange: [number, number];
}

const PRICE_MIN = 0;
const PRICE_MAX = 500;

const INITIAL: ProductSearchValues = {
  query: '',
  category: 'All',
  inStockOnly: false,
  priceRange: [PRICE_MIN, PRICE_MAX],
};

export function ProductSearchBar({ onSearch }: { onSearch?: (values: ProductSearchValues) => void }) {
  const [values, setValues] = useState<ProductSearchValues>(INITIAL);

  const update = <K extends keyof ProductSearchValues>(key: K, value: ProductSearchValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const [min, max] = values.priceRange;

  return (
    <Card>
      <form
        role="search"
        aria-label="Products"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch?.(values);
        }}
      >
        <Stack gap={4}>
          <Field label="Search products">
            <SearchInput
              value={values.query}
              onChange={(e) => update('query', e.target.value)}
              placeholder="Title, author, artist…"
            />
          </Field>

          <Grid gap={4} className="items-end">
            <Field label="Category">
              <Select
                value={values.category}
                onChange={(e) => update('category', e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Switch
              checked={values.inStockOnly}
              onChange={(e) => update('inStockOnly', e.target.checked)}
            >
              In stock only
            </Switch>
          </Grid>

          <Field
            label="Price range"
            hint={
              <>
                <FormattedNumber value={min} style="currency" currency="USD" /> to{' '}
                <FormattedNumber value={max} style="currency" currency="USD" />
              </>
            }
          >
            <Slider
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={5}
              value={values.priceRange}
              onChange={(v: number | number[]) => update('priceRange', v as [number, number])}
            />
          </Field>

          <Stack direction="row" gap={2}>
            <Button type="submit">Search</Button>
            <Button type="button" variant="ghost" onClick={() => setValues(INITIAL)}>
              Reset
            </Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}

export default ProductSearchBar;
