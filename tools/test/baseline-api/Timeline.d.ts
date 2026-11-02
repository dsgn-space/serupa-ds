// exports: Timeline, type TimelineAlign, TimelineItem, type TimelineItemProps, type TimelineProps, type TimelineStatus
type TimelineAlign = "alternate" | "start";
type TimelineStatus = "danger" | "info" | "neutral" | "primary" | "success" | "warning";
interface TimelineProps extends React.OlHTMLAttributes<HTMLOListElement> {
    align?: TimelineAlign | undefined;
    children?: React.ReactNode | undefined;
}
interface TimelineItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
    title?: React.ReactNode | undefined;
    time?: React.ReactNode | undefined;
    dateTime?: string | undefined;
    icon?: IconSource | undefined;
    status?: TimelineStatus | undefined;
    children?: React.ReactNode | undefined;
}
declare const Timeline: React.ForwardRefExoticComponent<TimelineProps & React.RefAttributes<HTMLOListElement>>;
declare const TimelineItem: React.ForwardRefExoticComponent<TimelineItemProps & React.RefAttributes<HTMLLIElement>>;
