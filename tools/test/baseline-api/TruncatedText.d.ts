// exports: TruncatedText, type TruncatedTextProps
interface TruncatedTextProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    children: string;
    lines?: number | undefined;
    as?: "div" | "p" | "span" | undefined;
    placement?: Placement | undefined;
    mode?: "end" | "middle" | undefined;
}
declare const TruncatedText: React.ForwardRefExoticComponent<TruncatedTextProps & React.RefAttributes<HTMLElement>>;
