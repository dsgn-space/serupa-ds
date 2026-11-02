// exports: Card, CardBody, type CardBodyProps, CardFooter, type CardFooterProps, CardHeader, type CardHeaderProps, type CardPadding, type CardProps, type CardVariant
type CardVariant = "elevated" | "filled" | "outline";
type CardPadding = "lg" | "md" | "none" | "sm";
interface CardProps extends React.HTMLAttributes<HTMLElement> {
    variant?: CardVariant | undefined;
    padding?: CardPadding | undefined;
    as?: "article" | "div" | "li" | "section" | undefined;
    href?: string | undefined;
    target?: string | undefined;
    rel?: string | undefined;
}
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLElement>>;
interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    title?: React.ReactNode | undefined;
    description?: React.ReactNode | undefined;
    action?: React.ReactNode | undefined;
    headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
}
declare const CardHeader: React.ForwardRefExoticComponent<CardHeaderProps & React.RefAttributes<HTMLDivElement>>;
type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;
declare const CardBody: React.ForwardRefExoticComponent<CardBodyProps & React.RefAttributes<HTMLDivElement>>;
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    justify?: "between" | "end" | "start" | undefined;
}
declare const CardFooter: React.ForwardRefExoticComponent<CardFooterProps & React.RefAttributes<HTMLDivElement>>;
