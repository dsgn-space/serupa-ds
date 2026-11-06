// exports: CodeBlock, type CodeBlockProps
interface CodeBlockLabels {
    codeCopy: string;
    codeName: string;
}
interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title"> {
    code: string;
    language?: string | undefined;
    title?: React.ReactNode | undefined;
    lineNumbers?: boolean | undefined;
    startLine?: number | undefined;
    highlight?: ReadonlyArray<number | readonly [
        number,
        number
    ]> | undefined;
    wrap?: boolean | undefined;
    copyable?: boolean | undefined;
}
declare const CodeBlock: React.ForwardRefExoticComponent<CodeBlockProps & React.RefAttributes<HTMLDivElement>>;
