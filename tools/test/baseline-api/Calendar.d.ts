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
    week: string;
    weekShort: string;
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
    calendar?: CalendarSystem | undefined;
    weekStartsOn?: number | undefined;
    weekNumbers?: boolean | undefined;
    autoFocus?: boolean | undefined;
    previousLabel?: string | undefined;
    nextLabel?: string | undefined;
    monthYearPicker?: boolean | undefined;
    presets?: boolean | DatePreset[] | undefined;
    headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
}
declare const Calendar: React.FC<CalendarProps & React.RefAttributes<HTMLDivElement>>;
