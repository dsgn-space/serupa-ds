// exports: formatNumber, type FormatNumberOptions, FormattedNumber, type FormattedNumberProps, type NumberFormat
type NumberFormat = "bytes" | "compact" | "currency" | "decimal" | "percent" | "unit";
interface FormatNumberOptions extends Intl.NumberFormatOptions {
    format?: NumberFormat;
}
declare function formatNumber(value: bigint | number, locale?: string, options?: FormatNumberOptions): string;
interface FormattedNumberProps extends Omit<React.DataHTMLAttributes<HTMLDataElement>, "children" | "value"> {
    value: bigint | number;
    format?: NumberFormat;
    currency?: string;
    unit?: string;
    options?: Intl.NumberFormatOptions;
    locale?: string;
}
declare const FormattedNumber: React.ForwardRefExoticComponent<FormattedNumberProps & React.RefAttributes<HTMLDataElement>>;
