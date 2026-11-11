// exports: DatePicker, type DatePickerProps
interface DatePickerLabels {
    chooseDate: string;
    inputNotAccepted: (text: string) => string;
    formatHint: (pattern: string) => string;
}
interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "children" | "defaultValue" | "max" | "min" | "onChange" | "size" | "value"> {
    value?: Date | null | string | undefined;
    defaultValue?: Date | null | string | undefined;
    onValueChange?: ((value: Date | null, iso: null | string) => void) | undefined;
    onInvalidInput?: ((text: string, reason: "unavailable" | "unreadable") => void) | undefined;
    min?: Date | string | undefined;
    max?: Date | string | undefined;
    isDateDisabled?: ((date: Date) => boolean) | undefined;
    locale?: string | undefined;
    weekStartsOn?: number | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    invalid?: boolean | undefined;
    buttonLabel?: string | undefined;
    presets?: boolean | DatePreset[] | undefined;
}
declare const DatePicker: React.ForwardRefExoticComponent<DatePickerProps & React.RefAttributes<HTMLInputElement>>;
