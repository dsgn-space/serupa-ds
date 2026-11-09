// exports: type DateRange, type DateRangeInput, DateRangePicker, type DateRangePickerProps, type DateRangePreset
interface DateRangePickerLabels {
    chooseDates: string;
    startDate: string;
    endDate: string;
    chooseStartDate: string;
    chooseEndDate: string;
    yesterday: string;
    last7Days: string;
    last30Days: string;
    thisMonth: string;
    lastMonth: string;
}
interface DateRange {
    start: Date | null;
    end: Date | null;
}
interface DateRangeInput {
    start: Date | null | string;
    end: Date | null | string;
}
interface DateRangePreset {
    label: string;
    value: (() => DateRangeInput) | DateRangeInput;
}
interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "defaultValue" | "onChange"> {
    value?: DateRangeInput | undefined;
    defaultValue?: DateRangeInput | undefined;
    onValueChange?: ((value: DateRange, iso: {
        start: null | string;
        end: null | string;
    }) => void) | undefined;
    onInvalidInput?: ((text: string, reason: "unavailable" | "unreadable") => void) | undefined;
    min?: Date | string | undefined;
    max?: Date | string | undefined;
    isDateDisabled?: ((date: Date) => boolean) | undefined;
    locale?: string | undefined;
    weekStartsOn?: number | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    invalid?: boolean | undefined;
    disabled?: boolean | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    id?: string | undefined;
    startLabel?: string | undefined;
    endLabel?: string | undefined;
    startName?: string | undefined;
    endName?: string | undefined;
    form?: string | undefined;
    buttonLabel?: string | undefined;
    months?: 1 | 2 | undefined;
    presets?: boolean | DateRangePreset[] | undefined;
}
declare const DateRangePicker: React.ForwardRefExoticComponent<DateRangePickerProps & React.RefAttributes<HTMLSpanElement>>;
