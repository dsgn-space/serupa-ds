// exports: SkipLink, type SkipLinkProps
interface SkipLinkLabels {
    skipToContent: string;
}
interface SkipLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    target?: string | undefined;
    children?: React.ReactNode | undefined;
}
declare const SkipLink: React.FC<SkipLinkProps & React.RefAttributes<HTMLAnchorElement>>;
