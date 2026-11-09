// exports: Calendar, type CalendarProps, type DatePreset
interface CalendarLabels {
    previousMonth: string;
    nextMonth: string;
    month: string;
    year: string;
    presets: string;
    today: string;
    tomorrow: string;
    inAWeek: string;
}
interface DatePreset {
    label: string;
    value: (() => Date | string) | Date | string;
}
interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: Date | null | string | undefined;
    defaultValue?: Date | null | string | undefined;
    onValueChange?: ((value: Date, iso: string) => void) | undefined;
    month?: Date | undefined;
    defaultMonth?: Date | undefined;
    onMonthChange?: ((month: Date) => void) | undefined;
    min?: Date | string | undefined;
    max?: Date | string | undefined;
    isDateDisabled?: ((date: Date) => boolean) | undefined;
    locale?: string | undefined;
    weekStartsOn?: number | undefined;
    autoFocus?: boolean | undefined;
    previousLabel?: string | undefined;
    nextLabel?: string | undefined;
    monthYearPicker?: boolean | undefined;
    presets?: boolean | DatePreset[] | undefined;
}
declare const Calendar: React.ForwardRefExoticComponent<CalendarProps & React.RefAttributes<HTMLDivElement>>;
