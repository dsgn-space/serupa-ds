import { useState } from "react";
// NOTE: I couldn't inspect serupa-ds in this session, so these component names
// and prop shapes (Input, Select, Switch, Slider) are assumed. Check them
// against the package's types before using this.
import { Input, Select, Switch, Slider } from "serupa-ds";

type Category = "all" | "books" | "music" | "games";

export interface ProductFilters {
  query: string;
  category: Category;
  inStockOnly: boolean;
  priceRange: [number, number];
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "books", label: "Books" },
  { value: "music", label: "Music" },
  { value: "games", label: "Games" },
];

const MIN_PRICE = 0;
const MAX_PRICE = 500;

export function ProductSearchBar({
  onChange,
}: {
  onChange?: (filters: ProductFilters) => void;
}) {
  const [filters, setFilters] = useState<ProductFilters>({
    query: "",
    category: "all",
    inStockOnly: false,
    priceRange: [MIN_PRICE, MAX_PRICE],
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
        alignItems: "flex-end",
        gap: 16,
      }}
    >
      <Input
        label="Search products"
        type="search"
        placeholder="Search products"
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
        <label id="price-label">
          Price: ${filters.priceRange[0]} – ${filters.priceRange[1]}
        </label>
        <Slider
          aria-labelledby="price-label"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={5}
          value={filters.priceRange}
          onChange={(value: [number, number]) => update({ priceRange: value })}
        />
      </div>
    </form>
  );
}

export default ProductSearchBar;
