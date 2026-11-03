// exports: ErrorBoundary, type ErrorBoundaryFallbackProps, type ErrorBoundaryProps
interface ErrorBoundaryLabels {
    errorTitle: string;
    errorDescription: string;
    tryAgain: string;
}
interface ErrorBoundaryFallbackProps {
    error: unknown;
    reset: () => void;
}
interface ErrorBoundaryProps {
    children?: React.ReactNode | undefined;
    fallback?: (((props: ErrorBoundaryFallbackProps) => React.ReactNode) | React.ReactNode) | undefined;
    title?: React.ReactNode | undefined;
    description?: React.ReactNode | undefined;
    onError?: ((error: unknown, info: React.ErrorInfo) => void) | undefined;
    onReset?: (() => void) | undefined;
    resetKeys?: ReadonlyArray<unknown> | undefined;
    className?: string | undefined;
}
declare const ErrorBoundary: ((props: ErrorBoundaryProps) => React.ReactElement) & {
    displayName: string;
};
