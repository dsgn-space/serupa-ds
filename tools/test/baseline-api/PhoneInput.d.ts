// exports: formatPhone, type ParsedPhone, parsePhone, type PhoneCountry, PhoneInput, type PhoneInputProps, type PhoneValueDetails
interface PhoneInputLabels {
    country: string;
}
interface PhoneCountry {
    code: string;
    dial: string;
    trunk: string;
    pattern: string;
    patterns?: Record<string, string> | undefined;
    areas?: string[] | undefined;
    min: number;
    max: number;
}
interface ParsedPhone {
    country: PhoneCountry;
    national: string;
}
declare function parsePhone(value: string, prefer?: string, countries?: readonly PhoneCountry[]): ParsedPhone | undefined;
declare function formatPhone(e164: string, prefer?: string): string;
interface PhoneValueDetails {
    country: string;
    national: string;
    complete: boolean;
}
interface PhoneInputProps extends Omit<InputProps, "defaultValue" | "leftIcon" | "onChange" | "prefix" | "rightIcon" | "showCount" | "suffix" | "type" | "value"> {
    value?: string | undefined;
    defaultValue?: string | undefined;
    onValueChange?: ((value: string, details: PhoneValueDetails) => void) | undefined;
    country?: string | undefined;
    defaultCountry?: string | undefined;
    onCountryChange?: ((country: string) => void) | undefined;
    countries?: Array<PhoneCountry | string> | undefined;
    countryLabel?: string | undefined;
    name?: string | undefined;
}
declare const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps & React.RefAttributes<HTMLInputElement>>;
