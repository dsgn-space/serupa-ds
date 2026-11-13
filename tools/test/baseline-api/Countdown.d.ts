// exports: Countdown, countdownClock, type CountdownProps, countdownWords
interface CountdownProps extends Omit<React.TimeHTMLAttributes<HTMLTimeElement>, "children" | "dateTime"> {
    to?: Date | number | string | undefined;
    seconds?: number | undefined;
    label: string;
    format?: "clock" | "words" | undefined;
    announceAt?: readonly number[] | undefined;
    endText?: string | undefined;
    onEnd?: (() => void) | undefined;
    locale?: string | undefined;
}
declare function countdownClock(seconds: number, locale?: string): string;
declare function countdownWords(seconds: number, locale?: string): string;
declare const Countdown: React.ForwardRefExoticComponent<CountdownProps & React.RefAttributes<HTMLTimeElement>>;
