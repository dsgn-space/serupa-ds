// exports: MaskedValue, type MaskedValueProps, maskValue
interface MaskedValueLabels {
    maskedEnding: (label: string, end: string) => string;
    maskedHidden: (label: string) => string;
    showValue: (label: string) => string;
}
interface MaskedValueProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
    value: string;
    label: string;
    end?: number | undefined;
    start?: number | undefined;
    revealable?: boolean | undefined;
    revealed?: boolean | undefined;
    defaultRevealed?: boolean | undefined;
    onRevealedChange?: ((revealed: boolean) => void) | undefined;
}
declare const MaskedValue: React.FC<MaskedValueProps & React.RefAttributes<HTMLSpanElement>>;
declare function maskValue(value: string, start?: number, end?: number): string;
