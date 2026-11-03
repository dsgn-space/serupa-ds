// exports: ButtonGroup, type ButtonGroupProps
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode | undefined;
    attached?: boolean | undefined;
    orientation?: "horizontal" | "vertical" | undefined;
    "aria-label"?: string | undefined;
}
declare const ButtonGroup: React.ForwardRefExoticComponent<ButtonGroupProps & React.RefAttributes<HTMLDivElement>>;
