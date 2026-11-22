// exports: Accordion, AccordionItem, type AccordionItemProps, type AccordionProps
interface AccordionLabels {
    expandAll: string;
    collapseAll: string;
}
interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    selectionMode?: "multiple" | "single" | undefined;
    value?: string[] | undefined;
    defaultValue?: string[] | undefined;
    onValueChange?: ((value: string[]) => void) | undefined;
    collapsible?: boolean | undefined;
    variant?: "card" | "plain" | undefined;
    headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
    showExpandAll?: boolean | undefined;
}
interface AccordionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    value?: string | undefined;
    title: React.ReactNode;
    disabled?: boolean | undefined;
    children?: React.ReactNode | undefined;
    keepMounted?: boolean | undefined;
}
declare const Accordion: React.FC<AccordionProps & React.RefAttributes<HTMLDivElement>>;
declare const AccordionItem: React.FC<AccordionItemProps & React.RefAttributes<HTMLDivElement>>;
