// exports: CodeBlock, type CodeBlockProps
interface CodeBlockLabels {
    codeCopy: string;
    codeName: string;
}
interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title"> {
    code: string;
    language?: string;
    title?: React.ReactNode;
    lineNumbers?: boolean;
    startLine?: number;
    highlight?: ReadonlyArray<number | readonly [
        number,
        number
    ]>;
    wrap?: boolean;
    copyable?: boolean;
}
declare const CodeBlock: React.ForwardRefExoticComponent<CodeBlockProps & React.RefAttributes<HTMLDivElement>>;
