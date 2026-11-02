// exports: SearchInput, type SearchInputProps
interface SearchInputLabels {
    searching: string;
    clearSearch: string;
}
interface SearchInputProps extends Omit<InputProps, "leftIcon" | "prefix" | "rightIcon" | "showCount" | "suffix" | "type"> {
    onSearch?: ((value: string) => void) | undefined;
    onClear?: (() => void) | undefined;
    clearLabel?: string | undefined;
    loading?: boolean | undefined;
    loadingLabel?: string | undefined;
}
declare const SearchInput: React.ForwardRefExoticComponent<SearchInputProps & React.RefAttributes<HTMLInputElement>>;
