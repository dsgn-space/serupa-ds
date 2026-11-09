// exports: DescriptionItem, type DescriptionItemProps, DescriptionList, type DescriptionListLayout, type DescriptionListProps
type DescriptionListLayout = "inline" | "split" | "stacked";
interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
    layout?: DescriptionListLayout | undefined;
    dividers?: boolean | undefined;
    children?: React.ReactNode | undefined;
}
declare const DescriptionList: React.ForwardRefExoticComponent<DescriptionListProps & React.RefAttributes<HTMLDListElement>>;
interface DescriptionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    term: React.ReactNode;
    children?: React.ReactNode | undefined;
    emphasis?: boolean | undefined;
}
declare const DescriptionItem: React.ForwardRefExoticComponent<DescriptionItemProps & React.RefAttributes<HTMLDivElement>>;
