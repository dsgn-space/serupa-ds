// exports: DateField, type DateFieldChangeDetails, type DateFieldProblem, type DateFieldProps, type DatePart
interface DateFieldLabels {
    dateFieldDay: string;
    dateFieldMonth: string;
    dateFieldYear: string;
}
type DatePart = "day" | "month" | "year";
type DateFieldProblem = "after-max" | "before-min" | "empty" | "missing-day" | "missing-month" | "missing-year" | "not-a-date";
interface DateFieldChangeDetails {
    day: string;
    month: string;
    year: string;
    problem: DateFieldProblem | null;
    parts: DatePart[];
    reason: "paste" | "reset" | "type";
}
interface DateFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: string | undefined;
    defaultValue?: string | undefined;
    onValueChange?: ((value: string, details: DateFieldChangeDetails) => void) | undefined;
    min?: string | undefined;
    max?: string | undefined;
    order?: "dmy" | "mdy" | "ymd" | undefined;
    autoComplete?: "bday" | "off" | undefined;
    name?: string | undefined;
    form?: string | undefined;
    disabled?: boolean | undefined;
    readOnly?: boolean | undefined;
    invalid?: boolean | undefined;
    size?: "lg" | "md" | "sm" | undefined;
}
declare const DateField: React.ForwardRefExoticComponent<DateFieldProps & React.RefAttributes<HTMLDivElement>>;
