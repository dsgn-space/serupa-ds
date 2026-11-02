// exports: Slider, type SliderMark, type SliderProps, type SliderValue
interface SliderLabels {
    sliderMinimum: string;
    sliderMaximum: string;
}
type SliderValue = [
    number,
    number
] | number;
interface SliderMark {
    value: number;
    label?: React.ReactNode;
}
interface SliderProps<V extends SliderValue = SliderValue> extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: undefined | V;
    defaultValue?: undefined | V;
    onValueChange?: ((value: V) => void) | undefined;
    onValueCommit?: ((value: V) => void) | undefined;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    largeStep?: number | undefined;
    size?: "md" | "sm" | undefined;
    disabled?: boolean | undefined;
    formatValue?: ((value: number) => string) | undefined;
    thumbLabels?: [
        string,
        string
    ] | undefined;
    name?: string | undefined;
    form?: string | undefined;
    invalid?: boolean | undefined;
    readOnly?: boolean | undefined;
    required?: boolean | undefined;
    marks?: boolean | SliderMark[] | undefined;
    showValue?: boolean | undefined;
}
declare const Slider: (<V extends SliderValue = SliderValue>(props: SliderProps<V> & React.RefAttributes<HTMLDivElement>) => null | React.ReactElement) & {
    displayName?: string;
};
