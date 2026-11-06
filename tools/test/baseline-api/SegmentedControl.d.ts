// exports: SegmentedControl, type SegmentedControlOption, type SegmentedControlProps
interface SegmentedControlOption<V extends string = string> {
    value: V;
    label?: React.ReactNode | undefined;
    icon?: IconSource | undefined;
    "aria-label"?: string | undefined;
    disabled?: boolean | undefined;
}
interface SegmentedControlProps<V extends string = string> extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    options: readonly SegmentedControlOption<V>[];
    value?: undefined | V;
    defaultValue?: undefined | V;
    onValueChange?: ((value: V) => void) | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    fullWidth?: boolean | undefined;
    disabled?: boolean | undefined;
    name?: string | undefined;
    form?: string | undefined;
    invalid?: boolean | undefined;
    required?: boolean | undefined;
    readOnly?: boolean | undefined;
}
declare const SegmentedControl: (<V extends string = string>(props: SegmentedControlProps<V> & React.RefAttributes<HTMLDivElement>) => null | React.ReactElement) & {
    displayName?: string;
};
