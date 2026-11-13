// exports: type StatusDay, type StatusState, StatusTracker, type StatusTrackerProps
interface StatusTrackerLabels {
    statusUp: string;
    statusDegraded: string;
    statusDown: string;
    statusNone: string;
    statusSummary: (percent: string, days: number, incidents: number) => string;
    statusDay: (date: string, state: string) => string;
}
type StatusState = "degraded" | "down" | "none" | "up";
interface StatusDay {
    date: Date | string;
    state: StatusState;
    note?: string | undefined;
}
interface StatusTrackerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    days: StatusDay[];
    label: string;
    summary?: null | React.ReactNode | undefined;
    legend?: boolean | undefined;
}
declare const StatusTracker: React.ForwardRefExoticComponent<StatusTrackerProps & React.RefAttributes<HTMLDivElement>>;
