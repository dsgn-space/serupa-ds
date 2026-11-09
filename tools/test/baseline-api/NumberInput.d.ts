// exports: NumberInput, type NumberInputProps
interface NumberInputLabels {
    decrease: string;
    increase: string;
}
interface NumberInputProps extends Omit<InputProps, "actions" | "defaultValue" | "max" | "min" | "rightIcon" | "showCount" | "step" | "type" | "value"> {
    value?: null | number | undefined;
    defaultValue?: null | number | undefined;
    onValueChange?: ((value: null | number) => void) | undefined;
    onInvalidInput?: ((text: string, reason: "range" | "unreadable") => void) | undefined;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    largeStep?: number | undefined;
    steppers?: boolean | undefined;
    decrementLabel?: string | undefined;
    incrementLabel?: string | undefined;
    locale?: string | undefined;
    formatOptions?: Intl.NumberFormatOptions | undefined;
    numberingSystem?: string | undefined;
    currency?: string | undefined;
    minorUnits?: boolean | undefined;
}
declare const NumberInput: React.ForwardRefExoticComponent<NumberInputProps & React.RefAttributes<HTMLInputElement>>;
