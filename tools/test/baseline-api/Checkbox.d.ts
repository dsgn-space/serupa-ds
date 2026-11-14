// exports: Checkbox, CheckboxGroup, type CheckboxGroupProps, type CheckboxProps
interface CheckboxLabels {
    selectAtLeastOne: string;
}
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    size?: "lg" | "md" | "sm" | undefined;
    children?: React.ReactNode | undefined;
    description?: React.ReactNode | undefined;
    indeterminate?: boolean | undefined;
    invalid?: boolean | undefined;
    variant?: "card" | "plain" | undefined;
    readOnly?: boolean | undefined;
    selectAll?: boolean | undefined;
    onCheckedChange?: ((checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
}
interface CheckboxGroupProps<V extends number | string = number | string> extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
    value?: readonly V[] | undefined;
    defaultValue?: readonly V[] | undefined;
    onValueChange?: ((value: V[], event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
    name?: string | undefined;
    orientation?: "horizontal" | "vertical" | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    variant?: "card" | "plain" | undefined;
    invalid?: boolean | undefined;
    disabled?: boolean | undefined;
    required?: boolean | undefined;
    children?: React.ReactNode | undefined;
}
declare const CheckboxGroup: (<V extends number | string = number | string>(props: CheckboxGroupProps<V> & React.RefAttributes<HTMLDivElement>) => null | React.ReactElement) & {
    displayName?: string;
};
declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
