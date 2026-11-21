// exports: Loader, type LoaderProps, type LoaderTone, type LoaderVariant
type LoaderVariant = "dots" | "ring" | "spokes" | "text";
type LoaderTone = "inverse" | "muted" | "neutral" | "primary";
interface LoaderProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: LoaderVariant | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    tone?: LoaderTone | undefined;
    label?: string | undefined;
    delay?: number | undefined;
    loading?: boolean | undefined;
}
declare const Loader: React.FC<LoaderProps & React.RefAttributes<HTMLSpanElement>>;
