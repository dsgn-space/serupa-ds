import { useMemo, useState } from "react";
// NOTE: I couldn't inspect the serupa-ds package in this session, so these
// component names and props are assumed. Check them against its docs.
import { Input, Select, Switch, Slider } from "serupa-ds";

type Category = "all" | "books" | "music" | "games";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "books", label: "Books" },
  { value: "music", label: "Music" },
  { value: "games", label: "Games" },
];

const PRICE_MIN = 0;
const PRICE_MAX = 500;

export interface ProductFilters {
  query: string;
  category: Category;
  inStockOnly: boolean;
  priceRange: [number, number];
}

interface ProductSearchBarProps {
  onChange?: (filters: ProductFilters) => void;
}

export default function ProductSearchBar({ onChange }: ProductSearchBarProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  const filters = useMemo<ProductFilters>(
    () => ({ query, category, inStockOnly, priceRange }),
    [query, category, inStockOnly, priceRange]
  );

  const update = (patch: Partial<ProductFilters>) =>
    onChange?.({ ...filters, ...patch });

  return (
    <form
      role="search"
      aria-label="Product search"
      onSubmit={(e) => {
        e.preventDefault();
        onChange?.(filters);
      }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: 16,
      }}
    >
      <div style={{ flex: "1 1 240px" }}>
        <Input
          label="Search products"
          type="search"
          placeholder="Search products…"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            update({ query: e.target.value });
          }}
        />
      </div>

      <div style={{ flex: "0 1 180px" }}>
        <Select
          label="Category"
          value={category}
          options={CATEGORIES}
          onChange={(value: Category) => {
            setCategory(value);
            update({ category: value });
          }}
        />
      </div>

      <Switch
        label="In stock only"
        checked={inStockOnly}
        onChange={(checked: boolean) => {
          setInStockOnly(checked);
          update({ inStockOnly: checked });
        }}
      />

      <div style={{ flex: "1 1 240px" }}>
        <label id="price-range-label">
          Price: ${priceRange[0]} – ${priceRange[1]}
        </label>
        <Slider
          aria-labelledby="price-range-label"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={5}
          value={priceRange}
          onChange={(value: [number, number]) => {
            setPriceRange(value);
            update({ priceRange: value });
          }}
        />
      </div>
    </form>
  );
}
