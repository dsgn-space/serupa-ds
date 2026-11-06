// exports: TimePicker, type TimePickerProps
interface TimePickerLabels {
    chooseTime: string;
}
interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "children" | "defaultValue" | "max" | "min" | "onChange" | "size" | "step" | "value"> {
    value?: null | string | undefined;
    defaultValue?: null | string | undefined;
    onValueChange?: ((value: null | string) => void) | undefined;
    onInvalidInput?: ((text: string, reason: "unavailable" | "unreadable") => void) | undefined;
    min?: string | undefined;
    max?: string | undefined;
    step?: number | undefined;
    locale?: string | undefined;
    hour12?: boolean | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    invalid?: boolean | undefined;
    listLabel?: string | undefined;
}
declare const TimePicker: React.ForwardRefExoticComponent<TimePickerProps & React.RefAttributes<HTMLInputElement>>;
