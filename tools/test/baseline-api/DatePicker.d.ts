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
    calendar?: CalendarSystem | undefined;
    weekStartsOn?: number | undefined;
    weekNumbers?: boolean | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    invalid?: boolean | undefined;
    buttonLabel?: string | undefined;
    presets?: boolean | DatePreset[] | undefined;
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
}
declare const DatePicker: React.FC<DatePickerProps & React.RefAttributes<HTMLInputElement>>;
