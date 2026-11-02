// exports: ColorPicker, type ColorPickerProps, type ColorSwatch
interface ColorPickerLabels {
    colorName: (hue: ColorHue, tone: ColorTone) => string;
    customColor: string;
    hexCode: string;
    contrast: (ratio: string) => string;
    lowContrast: (minimum: string) => string;
}
interface ColorSwatch {
    value: string;
    label: string;
}
interface ColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    swatches: ReadonlyArray<ColorSwatch | string>;
    value?: null | string | undefined;
    defaultValue?: null | string | undefined;
    onValueChange?: ((value: string) => void) | undefined;
    onValueCommit?: ((value: string) => void) | undefined;
    custom?: boolean | undefined;
    contrastWith?: string | undefined;
    minContrast?: number | undefined;
    size?: "md" | "sm" | undefined;
    disabled?: boolean | undefined;
    name?: string | undefined;
    form?: string | undefined;
    required?: boolean | undefined;
    invalid?: boolean | undefined;
}
declare const ColorPicker: React.ForwardRefExoticComponent<ColorPickerProps & React.RefAttributes<HTMLDivElement>>;
