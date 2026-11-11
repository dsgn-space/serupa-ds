// exports: Text, type TextProps, type TextSize, type TextTone, type TextWeight
type TextSize = "base" | "lg" | "sm" | "xl" | "xs";
type TextTone = "danger" | "default" | "muted" | "primary";
type TextWeight = "bold" | "medium" | "normal" | "semibold";
interface TextProps extends React.HTMLAttributes<HTMLElement> {
    as?: "div" | "em" | "figcaption" | "label" | "li" | "p" | "small" | "span" | "strong" | undefined;
    size?: TextSize | undefined;
    tone?: TextTone | undefined;
    weight?: TextWeight | undefined;
    truncate?: boolean | undefined;
    lines?: number | undefined;
    measure?: boolean | undefined;
    htmlFor?: string | undefined;
}
declare const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<HTMLElement>>;
