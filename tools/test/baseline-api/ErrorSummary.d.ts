// exports: ErrorSummary, type ErrorSummaryItem, type ErrorSummaryProps
interface ErrorSummaryLabels {
    errorSummaryTitle: (count: number, formatted: string) => string;
}
interface ErrorSummaryItem {
    field: string;
    message: React.ReactNode;
}
interface ErrorSummaryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    errors?: readonly ErrorSummaryItem[] | undefined;
    title?: React.ReactNode | undefined;
    headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
    description?: React.ReactNode | undefined;
    autoFocus?: boolean | undefined;
}
declare const ErrorSummary: React.ForwardRefExoticComponent<ErrorSummaryProps & React.RefAttributes<HTMLDivElement>>;
