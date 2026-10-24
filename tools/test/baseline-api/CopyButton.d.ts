// exports: CopyButton, type CopyButtonProps
interface CopyButtonLabels {
    copied: string;
    copyFailed: string;
}
interface CopyButtonProps extends Omit<ButtonAsButtonProps, "icon" | "leftIcon" | "loading" | "loadingText" | "onCopy" | "rightIcon" | "value"> {
    value: (() => Promise<string> | string) | string;
    children?: React.ReactNode;
    copiedLabel?: string;
    iconOnly?: boolean;
    timeout?: number;
    onCopy?: (text: string) => void;
    onCopyError?: (error: unknown) => void;
}
declare const CopyButton: React.ForwardRefExoticComponent<CopyButtonProps & React.RefAttributes<HTMLButtonElement>>;
