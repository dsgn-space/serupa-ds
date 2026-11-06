// exports: Rating, type RatingProps
interface RatingLabels {
    ratingStars: (value: number) => string;
    ratingValue: (value: number, max: number) => string;
}
interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: null | number | undefined;
    defaultValue?: null | number | undefined;
    onValueChange?: ((value: null | number) => void) | undefined;
    max?: number | undefined;
    allowHalf?: boolean | undefined;
    clearable?: boolean | undefined;
    readOnly?: boolean | undefined;
    disabled?: boolean | undefined;
    name?: string | undefined;
    form?: string | undefined;
    required?: boolean | undefined;
    invalid?: boolean | undefined;
    size?: "lg" | "md" | "sm" | undefined;
}
declare const Rating: React.ForwardRefExoticComponent<RatingProps & React.RefAttributes<HTMLDivElement>>;
