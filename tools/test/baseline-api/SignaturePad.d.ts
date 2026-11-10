// exports: type SignatureChangeDetails, type SignatureMethod, SignaturePad, type SignaturePadProps, signatureToPng, type SignatureValue
interface SignaturePadLabels {
    signatureMethod: string;
    signatureDraw: string;
    signatureType: string;
    signatureDrawHint: string;
    signatureTypeHint: string;
    signatureEmpty: string;
    signatureDrawn: string;
    signatureUndo: string;
    signatureClear: string;
    signatureName: string;
}
type SignatureMethod = "draw" | "type";
interface SignatureValue {
    method: SignatureMethod;
    svg: string;
    name: string;
}
interface SignatureChangeDetails {
    reason: "clear" | "draw" | "method" | "reset" | "type" | "undo";
}
interface SignaturePadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: null | SignatureValue | undefined;
    defaultValue?: null | SignatureValue | undefined;
    onValueChange?: ((value: null | SignatureValue, details: SignatureChangeDetails) => void) | undefined;
    defaultMethod?: SignatureMethod | undefined;
    name?: string | undefined;
    form?: string | undefined;
    disabled?: boolean | undefined;
    invalid?: boolean | undefined;
}
declare function signatureToPng(svg: string, scale?: number): Promise<Blob | null>;
declare const SignaturePad: React.ForwardRefExoticComponent<SignaturePadProps & React.RefAttributes<HTMLDivElement>>;
