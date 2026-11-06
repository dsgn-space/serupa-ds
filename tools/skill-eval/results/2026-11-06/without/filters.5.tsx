// NOTE: I couldn't inspect the serupa-ds package in this session. The component
// names and props below (Input, Select, Switch, Slider, onChange signatures)
// are assumed. Check them against the library's docs before using this.
import { useState } from "react";
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

export function ProductSearchBar({ onChange }: ProductSearchBarProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    query: "",
    category: "all",
    inStockOnly: false,
    priceRange: [PRICE_MIN, PRICE_MAX],
  });

  const update = (patch: Partial<ProductFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onChange?.(next);
  };

  return (
    <form
      role="search"
      aria-label="Product search"
      onSubmit={(e) => e.preventDefault()}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "flex-end",
      }}
    >
      <Input
        label="Search products"
        type="search"
        placeholder="Search products…"
        value={filters.query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          update({ query: e.target.value })
        }
      />

      <Select
        label="Category"
        value={filters.category}
        onChange={(value: Category) => update({ category: value })}
        options={CATEGORIES}
      />

      <Switch
        label="In stock only"
        checked={filters.inStockOnly}
        onChange={(checked: boolean) => update({ inStockOnly: checked })}
      />

      <div style={{ minWidth: 220 }}>
        <Slider
          label={`Price: $${filters.priceRange[0]} – $${filters.priceRange[1]}`}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={5}
          value={filters.priceRange}
          onChange={(value: [number, number]) => update({ priceRange: value })}
        />
      </div>
    </form>
  );
}

export default ProductSearchBar;
