// exports: Combobox, type ComboboxFreeTextProps, type ComboboxMultipleProps, type ComboboxOption, type ComboboxOptionGroup, type ComboboxProps, type ComboboxSingleProps
interface ComboboxLabels {
    loadingResults: string;
    loadFailed: string;
    noResults: string;
    resultsCount: (count: number, formatted: string) => string;
    showOptions: string;
    clearValue: (label: string) => string;
    createOption: (text: string) => string;
    moreResults: (count: number, formatted: string) => string;
    valueAdded: (label: string) => string;
    valueRemoved: (label: string) => string;
}
type ComboboxOption<V extends string = string> = {
    value: V;
    label: string;
    description?: React.ReactNode;
    disabled?: boolean;
} | V;
interface ComboboxOptionGroup<V extends string = string> {
    label: string;
    options: readonly ComboboxOption<V>[];
    disabled?: boolean;
}
interface ComboboxBaseProps<V extends string = string> extends Omit<InputProps, "actions" | "defaultValue" | "onChange" | "prefix" | "rightIcon" | "showCount" | "suffix" | "type" | "value"> {
    options?: readonly (ComboboxOption<V> | ComboboxOptionGroup<V>)[] | undefined;
    loadOptions?: ((text: string, context: {
        signal: AbortSignal;
    }) => Promise<readonly (ComboboxOption<V> | ComboboxOptionGroup<V>)[]>) | undefined;
    debounce?: number | undefined;
    inputValue?: string | undefined;
    defaultInputValue?: string | undefined;
    onInputChange?: ((text: string) => void) | undefined;
    filter?: (((option: {
        value: V;
        label: string;
    }, text: string) => boolean) | false) | undefined;
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    clearable?: boolean | undefined;
    loading?: boolean | undefined;
    emptyText?: React.ReactNode | undefined;
    loadingText?: string | undefined;
    toggleLabel?: string | undefined;
    clearLabel?: string | undefined;
    onCreate?: ((text: string) => V | void) | undefined;
    limit?: number | undefined;
}
interface ComboboxSingleProps<V extends string = string> extends ComboboxBaseProps<V> {
    multiple?: false | undefined;
    freeText?: false | undefined;
    value?: null | undefined | V;
    defaultValue?: null | undefined | V;
    onValueChange?: ((value: null | V) => void) | undefined;
}
interface ComboboxFreeTextProps<V extends string = string> extends ComboboxBaseProps<V> {
    freeText: true;
    inlineComplete?: boolean | undefined;
    multiple?: false | undefined;
    value?: null | string | undefined;
    defaultValue?: null | string | undefined;
    onValueChange?: ((value: null | string) => void) | undefined;
}
interface ComboboxMultipleProps<V extends string = string> extends ComboboxBaseProps<V> {
    multiple: true;
    freeText?: false | undefined;
    value?: readonly V[] | undefined;
    defaultValue?: readonly V[] | undefined;
    onValueChange?: ((value: V[]) => void) | undefined;
}
type ComboboxProps<V extends string = string> = ComboboxFreeTextProps<V> | ComboboxMultipleProps<V> | ComboboxSingleProps<V>;
declare const Combobox: (<V extends string = string>(props: ComboboxProps<V> & React.RefAttributes<HTMLInputElement>) => null | React.ReactElement) & {
    displayName?: string;
};
