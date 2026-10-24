// exports: Calendar, type CalendarProps
interface CalendarLabels {
    previousMonth: string;
    nextMonth: string;
}
interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date) => void;
    month?: Date;
    defaultMonth?: Date;
    onMonthChange?: (month: Date) => void;
    min?: Date;
    max?: Date;
    isDateDisabled?: (date: Date) => boolean;
    locale?: string;
    weekStartsOn?: number;
    autoFocus?: boolean;
    previousLabel?: string;
    nextLabel?: string;
    dayClassName?: (date: Date) => string | undefined;
    isDateSelected?: (date: Date) => boolean;
    onDayHover?: (date: Date) => void;
    hideOutside?: boolean;
}
declare const Calendar: React.ForwardRefExoticComponent<CalendarProps & React.RefAttributes<HTMLDivElement>>;
