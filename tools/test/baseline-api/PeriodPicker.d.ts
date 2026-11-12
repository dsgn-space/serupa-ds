// exports: PeriodPicker, type PeriodPickerProps, type PeriodUnit
interface PeriodPickerLabels {
    periodPlaceholder: (unit: "month" | "quarter" | "year") => string;
    periodPrevious: (unit: "month" | "quarter" | "year") => string;
    periodNext: (unit: "month" | "quarter" | "year") => string;
    periodQuarter: (quarter: number, year?: string) => string;
}
type PeriodUnit = "month" | "quarter" | "year";
interface PeriodPickerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "defaultValue" | "onChange" | "type" | "value"> {
    unit?: PeriodUnit | undefined;
    value?: null | string | undefined;
    defaultValue?: null | string | undefined;
    onValueChange?: ((value: string, range: {
        start: Date;
        end: Date;
    }) => void) | undefined;
    min?: string | undefined;
    max?: string | undefined;
    locale?: string | undefined;
    placeholder?: string | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    invalid?: boolean | undefined;
    readOnly?: boolean | undefined;
    name?: string | undefined;
    defaultOpen?: boolean | undefined;
}
declare const PeriodPicker: React.ForwardRefExoticComponent<PeriodPickerProps & React.RefAttributes<HTMLButtonElement>>;
