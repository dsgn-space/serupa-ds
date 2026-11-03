// exports: CopyButton, type CopyButtonProps
interface CopyButtonLabels {
    copied: string;
    copyFailed: string;
}
interface CopyButtonProps extends Omit<ButtonAsButtonProps, "icon" | "leftIcon" | "loading" | "loadingText" | "onCopy" | "rightIcon" | "value"> {
    value: (() => Promise<string> | string) | string;
    children?: React.ReactNode | undefined;
    copiedLabel?: string | undefined;
    iconOnly?: boolean | undefined;
    timeout?: number | undefined;
    onCopy?: ((text: string) => void) | undefined;
    onCopyError?: ((error: unknown) => void) | undefined;
}
declare const CopyButton: React.ForwardRefExoticComponent<CopyButtonProps & React.RefAttributes<HTMLButtonElement>>;
