// exports: FilterBar, type FilterBarProps, type FilterField, type FilterOption, type FilterValue, type FilterValues
interface FilterBarLabels {
    filterBar: string;
    filterAdd: string;
    filterClear: string;
    filterIs: (field: string, values: string) => string;
    filterContains: (field: string, text: string) => string;
    filterFrom: (field: string, date: string) => string;
    filterUntil: (field: string, date: string) => string;
    filterAny: (field: string) => string;
    filterRemove: (field: string) => string;
    filterDone: string;
    filterResults: (count: number) => string;
}
type FilterOption = {
    value: string;
    label: string;
} | string;
type FilterField = {
    id: string;
    label: string;
    type: "boolean";
} | {
    id: string;
    label: string;
    type: "date-range";
} | {
    id: string;
    label: string;
    type: "select";
    options: FilterOption[];
    multiple?: boolean | undefined;
} | {
    id: string;
    label: string;
    type: "text";
    placeholder?: string | undefined;
};
type FilterValue = {
    start: null | string;
    end: null | string;
} | boolean | string | string[];
type FilterValues = Record<string, FilterValue>;
interface FilterBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
    fields: FilterField[];
    value?: FilterValues | undefined;
    defaultValue?: FilterValues | undefined;
    onValueChange?: ((value: FilterValues) => void) | undefined;
    resultsCount?: number | undefined;
    actions?: React.ReactNode | undefined;
}
declare const FilterBar: React.ForwardRefExoticComponent<FilterBarProps & React.RefAttributes<HTMLDivElement>>;
