// exports: EmptyState, type EmptyStateProps
interface EmptyStateLabels {
    didYouMean: string;
    clearFilters: string;
}
interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    icon?: IconSource | undefined;
    title: React.ReactNode;
    description?: React.ReactNode | undefined;
    actions?: React.ReactNode | undefined;
    size?: "md" | "sm" | undefined;
    variant?: "dashed" | "plain" | undefined;
    headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
    announce?: boolean | undefined;
    suggestions?: string[] | undefined;
    onSuggestion?: ((suggestion: string) => void) | undefined;
    onClearFilters?: (() => void) | undefined;
}
declare const EmptyState: React.ForwardRefExoticComponent<EmptyStateProps & React.RefAttributes<HTMLDivElement>>;
