// exports: CopyButton, type CopyButtonProps
interface CopyButtonLabels {
    copied: string;
    copyFailed: string;
    copyFailedShort: string;
}
interface CopyButtonProps extends Omit<ButtonAsButtonProps, "endIcon" | "icon" | "loading" | "loadingLabel" | "loadingText" | "onCopy" | "startIcon" | "value"> {
    value: (() => Promise<string> | string) | string;
    children?: React.ReactNode | undefined;
    copiedLabel?: string | undefined;
    iconOnly?: boolean | undefined;
    timeout?: number | undefined;
    onCopy?: ((text: string) => void) | undefined;
    onCopyError?: ((error: unknown) => void) | undefined;
}
declare const CopyButton: React.FC<CopyButtonProps & React.RefAttributes<HTMLButtonElement>>;
