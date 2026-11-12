// exports: Quote, type QuoteProps
interface QuoteProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
    author?: React.ReactNode;
    source?: React.ReactNode;
    avatar?: React.ReactNode;
    cite?: string | undefined;
    size?: "lg" | "md" | undefined;
}
declare const Quote: React.ForwardRefExoticComponent<QuoteProps & React.RefAttributes<HTMLElement>>;
