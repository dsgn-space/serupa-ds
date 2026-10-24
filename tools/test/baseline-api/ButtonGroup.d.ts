// exports: ButtonGroup, type ButtonGroupProps
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    attached?: boolean;
    orientation?: "horizontal" | "vertical";
    "aria-label"?: string;
}
declare const ButtonGroup: React.ForwardRefExoticComponent<ButtonGroupProps & React.RefAttributes<HTMLDivElement>>;
