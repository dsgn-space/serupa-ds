// exports: Timeline, type TimelineAlign, TimelineItem, type TimelineItemProps, type TimelineOrientation, type TimelineProps, type TimelineTone
interface TimelineLabels {
    timeline: string;
}
type TimelineAlign = "alternate" | "start";
type TimelineOrientation = "horizontal" | "vertical";
type TimelineTone = "danger" | "info" | "neutral" | "primary" | "success" | "warning";
interface TimelineProps extends React.OlHTMLAttributes<HTMLOListElement> {
    align?: TimelineAlign | undefined;
    orientation?: TimelineOrientation | undefined;
    stackWhenNarrow?: boolean | undefined;
    children?: React.ReactNode | undefined;
}
interface TimelineItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
    title?: React.ReactNode | undefined;
    time?: React.ReactNode | undefined;
    dateTime?: string | undefined;
    icon?: IconSource | undefined;
    tone?: TimelineTone | undefined;
    children?: React.ReactNode | undefined;
}
declare const Timeline: React.FC<TimelineProps & React.RefAttributes<HTMLOListElement>>;
declare const TimelineItem: React.FC<TimelineItemProps & React.RefAttributes<HTMLLIElement>>;
