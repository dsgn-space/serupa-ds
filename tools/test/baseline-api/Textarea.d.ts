// exports: Textarea, type TextareaProps
interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "children" | "rows"> {
    size?: "lg" | "md" | "sm" | undefined;
    rows?: number | undefined;
    autoResize?: boolean | undefined;
    maxRows?: number | undefined;
    resize?: "none" | "vertical" | undefined;
    invalid?: boolean | undefined;
    showCount?: boolean | undefined;
}
declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
