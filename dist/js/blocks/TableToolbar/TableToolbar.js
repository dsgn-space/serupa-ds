// src/blocks/TableToolbar/TableToolbar.tsx
import * as React from "react";
import { Button } from "../../components/Button/Button.js";
import { Field } from "../../components/Field/Field.js";
import { SearchInput } from "../../components/SearchInput/SearchInput.js";
import { Select } from "../../components/Select/Select.js";
import { TableActionBar } from "../../components/Table/Table.js";
var EN = {
  landmark: (noun) => `Search and filter ${noun}`,
  search: "Search",
  clearFilters: "Clear filters"
};
function TableToolbar({ noun, query, onQueryChange, filters = [], results, onClearFilters, selectedCount = 0, onClearSelection, bulkActions, labels, children }) {
  const w = { ...EN, ...labels };
  const search = React.useRef(null);
  const filtered = query !== "" || filters.some((f) => f.value !== "");
  const clear = () => {
    onClearFilters();
    search.current?.focus();
  };
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-3" }, /* @__PURE__ */ React.createElement("form", { role: "search", "aria-label": w.landmark(noun), onSubmit: (e) => e.preventDefault(), className: "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" }, /* @__PURE__ */ React.createElement(Field, { label: w.search, className: "sm:flex-1" }, /* @__PURE__ */ React.createElement(SearchInput, { ref: search, value: query, onChange: (e) => onQueryChange(e.target.value) })), filters.map((f) => /* @__PURE__ */ React.createElement(Field, { key: f.label, label: f.label }, /* @__PURE__ */ React.createElement(Select, { value: f.value, options: f.options, onChange: (e) => f.onChange(e.target.value) }))), filtered ? /* @__PURE__ */ React.createElement(Button, { type: "button", variant: "ghost", onClick: clear }, w.clearFilters) : null), /* @__PURE__ */ React.createElement("p", { role: "status", className: "m-0 text-sm text-text-muted" }, results), /* @__PURE__ */ React.createElement(TableActionBar, { count: selectedCount, onClear: onClearSelection }, bulkActions), children);
}
export {
  TableToolbar
};
//# sourceMappingURL=TableToolbar.js.map
