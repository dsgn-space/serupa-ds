// exports: type CalendarEvent, EventCalendar, type EventCalendarProps, type EventCalendarView
interface EventCalendarLabels {
    goToToday: string;
    calendarView: string;
    monthView: string;
    weekView: string;
    dayView: string;
    agendaView: string;
    previousWeek: string;
    nextWeek: string;
    previousDay: string;
    nextDay: string;
    eventCount: (count: number, formatted: string) => string;
    moreEvents: (count: number, formatted: string) => string;
    allDay: string;
    eventTime: (from: string, to: string) => string;
    repeats: string;
    noEvents: string;
}
interface CalendarEvent {
    id: string;
    title: string;
    start: Date | string;
    end?: Date | string | undefined;
    allDay?: boolean | undefined;
    repeating?: boolean | undefined;
    tone?: "danger" | "info" | "primary" | "success" | "warning" | undefined;
}
type EventCalendarView = "agenda" | "day" | "month" | "week";
interface EventCalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
    events: readonly CalendarEvent[];
    onEventClick?: ((event: CalendarEvent) => void) | undefined;
    month?: Date | undefined;
    defaultMonth?: Date | undefined;
    onMonthChange?: ((month: Date) => void) | undefined;
    view?: EventCalendarView | undefined;
    defaultView?: EventCalendarView | undefined;
    onViewChange?: ((view: EventCalendarView) => void) | undefined;
    maxPerDay?: number | undefined;
    locale?: string | undefined;
    weekStartsOn?: number | undefined;
    headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
}
declare const EventCalendar: React.ForwardRefExoticComponent<EventCalendarProps & React.RefAttributes<HTMLDivElement>>;
