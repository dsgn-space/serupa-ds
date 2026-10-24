// exports: Card, CardBody, type CardBodyProps, CardFooter, type CardFooterProps, CardHeader, type CardHeaderProps, type CardPadding, type CardProps, type CardVariant
type CardVariant = "elevated" | "filled" | "outline";
type CardPadding = "lg" | "md" | "none" | "sm";
interface CardProps extends React.HTMLAttributes<HTMLElement> {
    variant?: CardVariant;
    padding?: CardPadding;
    as?: "article" | "div" | "li" | "section";
    href?: string;
    target?: string;
    rel?: string;
}
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLElement>>;
interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
}
declare const CardHeader: React.ForwardRefExoticComponent<CardHeaderProps & React.RefAttributes<HTMLDivElement>>;
type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;
declare const CardBody: React.ForwardRefExoticComponent<CardBodyProps & React.RefAttributes<HTMLDivElement>>;
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    justify?: "between" | "end" | "start";
}
declare const CardFooter: React.ForwardRefExoticComponent<CardFooterProps & React.RefAttributes<HTMLDivElement>>;
