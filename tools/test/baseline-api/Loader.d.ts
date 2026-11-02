// exports: Loader, type LoaderPattern, type LoaderProps, type LoaderShape, type LoaderTone, type LoaderVariant
type LoaderVariant = "dots" | "pixel" | "ring" | "skeleton" | "spokes" | "text";
type LoaderShape = "circle" | "rect" | "text";
type LoaderPattern = "checker" | "cross" | "fall" | "random" | "rise" | "snake" | "spiral" | "sweep" | "wave";
type LoaderTone = "inverse" | "muted" | "neutral" | "primary";
interface LoaderProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: LoaderVariant | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    tone?: LoaderTone | undefined;
    label?: string | undefined;
    shape?: LoaderShape | undefined;
    lines?: number | undefined;
    pattern?: LoaderPattern | undefined;
    glow?: boolean | undefined;
    delay?: number | undefined;
    loading?: boolean | undefined;
}
declare const Loader: React.ForwardRefExoticComponent<LoaderProps & React.RefAttributes<HTMLSpanElement>>;
