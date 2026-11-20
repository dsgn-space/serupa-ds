// exports: Duration, type DurationDisplay, type DurationProps, type DurationUnit, formatDuration, type FormatDurationOptions, isoDuration
type DurationUnit = "day" | "hour" | "millisecond" | "minute" | "second";
type DurationDisplay = "digital" | "long" | "narrow" | "short";
interface FormatDurationOptions {
    unit?: DurationUnit | undefined;
    display?: DurationDisplay | undefined;
    smallest?: Exclude<DurationUnit, "millisecond"> | undefined;
    largest?: Exclude<DurationUnit, "millisecond"> | undefined;
}
interface DurationProps extends Omit<React.TimeHTMLAttributes<HTMLTimeElement>, "children" | "dateTime">, FormatDurationOptions {
    value: number;
    locale?: string | undefined;
}
declare function formatDuration(value: number, locale?: string, options?: FormatDurationOptions): string;
declare function isoDuration(value: number, options?: Pick<FormatDurationOptions, "smallest" | "unit">): string;
declare const Duration: React.FC<DurationProps & React.RefAttributes<HTMLTimeElement>>;
