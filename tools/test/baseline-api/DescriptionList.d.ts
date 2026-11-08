// exports: DescriptionItem, type DescriptionItemProps, DescriptionList, type DescriptionListLayout, type DescriptionListProps
type DescriptionListLayout = "inline" | "split" | "stacked";
interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
    layout?: DescriptionListLayout;
    dividers?: boolean;
    children?: React.ReactNode;
}
declare const DescriptionList: React.ForwardRefExoticComponent<DescriptionListProps & React.RefAttributes<HTMLDListElement>>;
interface DescriptionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    term: React.ReactNode;
    children?: React.ReactNode;
    emphasis?: boolean;
}
declare const DescriptionItem: React.ForwardRefExoticComponent<DescriptionItemProps & React.RefAttributes<HTMLDivElement>>;
