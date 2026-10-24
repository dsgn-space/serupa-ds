// exports: formatPhone, type ParsedPhone, parsePhone, type PhoneCountry, PhoneInput, type PhoneInputProps, type PhoneValueDetails
interface PhoneInputLabels {
    country: string;
}
interface PhoneValueDetails {
    country: string;
    national: string;
    complete: boolean;
}
interface PhoneInputProps extends Omit<InputProps, "defaultValue" | "leftIcon" | "onChange" | "rightIcon" | "type" | "value"> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string, details: PhoneValueDetails) => void;
    country?: string;
    defaultCountry?: string;
    onCountryChange?: (country: string) => void;
    countries?: string[];
    countryLabel?: string;
    name?: string;
}
declare const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps & React.RefAttributes<HTMLInputElement>>;
interface PhoneCountry {
    code: string;
    dial: string;
    trunk: string;
    pattern: string;
    min: number;
    max: number;
}
interface ParsedPhone {
    country: PhoneCountry;
    national: string;
}
declare function parsePhone(value: string, prefer?: string): ParsedPhone | undefined;
declare function formatPhone(e164: string, prefer?: string): string;
