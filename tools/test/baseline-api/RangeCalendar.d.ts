// exports: RangeCalendar, type RangeCalendarProps
interface RangeCalendarLabels {
    inRange: string;
    rangeSelected: (range: string) => string;
}
interface RangeCalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: DateRangeInput | null | undefined;
    defaultValue?: DateRangeInput | null | undefined;
    onValueChange?: ((value: {
        start: Date;
        end: Date;
    }, iso: {
        start: string;
        end: string;
    }) => void) | undefined;
    months?: 1 | 2 | undefined;
    month?: Date | undefined;
    defaultMonth?: Date | undefined;
    onMonthChange?: ((month: Date) => void) | undefined;
    min?: Date | string | undefined;
    max?: Date | string | undefined;
    isDateDisabled?: ((date: Date) => boolean) | undefined;
    locale?: string | undefined;
    weekStartsOn?: number | undefined;
    autoFocus?: boolean | undefined;
}
declare const RangeCalendar: React.ForwardRefExoticComponent<RangeCalendarProps & React.RefAttributes<HTMLDivElement>>;
