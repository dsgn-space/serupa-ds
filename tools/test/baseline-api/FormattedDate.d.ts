// exports: type DateValue, formatDate, type FormatDateOptions, FormattedDate, type FormattedDateProps
type DateValue = Date | number | string;
interface FormatDateOptions {
    to?: DateValue | undefined;
    dateStyle?: "full" | "long" | "medium" | "short" | false | undefined;
    timeStyle?: "full" | "long" | "medium" | "short" | undefined;
    timeZone?: string | undefined;
    options?: Intl.DateTimeFormatOptions | undefined;
}
interface FormattedDateProps extends Omit<React.TimeHTMLAttributes<HTMLTimeElement>, "children" | "dateTime">, FormatDateOptions {
    value: DateValue;
    locale?: string | undefined;
}
declare function formatDate(value: DateValue, locale?: string, options?: FormatDateOptions): string;
declare const FormattedDate: React.FC<FormattedDateProps & React.RefAttributes<HTMLElement>>;
