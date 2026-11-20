// exports: ButtonGroup, type ButtonGroupProps
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode | undefined;
    attached?: boolean | undefined;
    orientation?: "horizontal" | "vertical" | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    "aria-label"?: string | undefined;
}
declare const ButtonGroup: React.FC<ButtonGroupProps & React.RefAttributes<HTMLDivElement>>;
