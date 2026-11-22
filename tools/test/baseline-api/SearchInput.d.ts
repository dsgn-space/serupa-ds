// exports: SearchInput, type SearchInputProps
interface SearchInputLabels {
    searching: string;
    clearSearch: string;
}
interface SearchInputProps extends Omit<InputProps, "actions" | "endIcon" | "prefix" | "showCount" | "startIcon" | "suffix" | "type"> {
    onSearch?: ((value: string) => void) | undefined;
    onClear?: (() => void) | undefined;
    clearLabel?: string | undefined;
    loading?: boolean | undefined;
    loadingLabel?: string | undefined;
}
declare const SearchInput: React.FC<SearchInputProps & React.RefAttributes<HTMLInputElement>>;
