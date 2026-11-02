// exports: allTimeZones, timeZoneInfo, type TimeZoneInfo, TimeZonePicker, type TimeZonePickerProps
interface TimeZonePickerLabels {
    timeZoneYours: string;
}
interface TimeZonePickerProps extends Omit<ComboboxSingleProps, "debounce" | "filter" | "loadOptions" | "multiple" | "options"> {
    zones?: readonly string[];
    at?: Date | number;
    locale?: string;
}
interface TimeZoneInfo {
    zone: string;
    city: string;
    offset: number;
    offsetText: string;
    name: string;
}
declare function allTimeZones(): string[];
declare function timeZoneInfo(zone: string, locale: string, at?: Date): null | TimeZoneInfo;
declare const TimeZonePicker: React.ForwardRefExoticComponent<TimeZonePickerProps & React.RefAttributes<HTMLInputElement>>;
