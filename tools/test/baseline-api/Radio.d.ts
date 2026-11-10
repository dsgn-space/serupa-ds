// exports: Radio, RadioGroup, type RadioGroupProps, type RadioProps
interface RadioGroupProps<V extends number | string = number | string> extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    name?: string | undefined;
    value?: null | undefined | V;
    defaultValue?: undefined | V;
    onValueChange?: ((value: V, event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
    orientation?: "horizontal" | "vertical" | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    invalid?: boolean | undefined;
    disabled?: boolean | undefined;
    required?: boolean | undefined;
    readOnly?: boolean | undefined;
    children?: React.ReactNode | undefined;
}
interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    size?: "lg" | "md" | "sm" | undefined;
    children?: React.ReactNode | undefined;
    description?: React.ReactNode | undefined;
    invalid?: boolean | undefined;
}
declare const RadioGroup: (<V extends number | string = number | string>(props: RadioGroupProps<V> & React.RefAttributes<HTMLDivElement>) => null | React.ReactElement) & {
    displayName?: string;
};
declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
