// exports: Tab, TabList, type TabListProps, TabPanel, type TabPanelProps, type TabProps, Tabs, type TabsProps, type TabsVariant
interface TabsLabels {
    tabCloseHint: string;
}
type TabsVariant = "line" | "pill";
interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: string | undefined;
    defaultValue?: string | undefined;
    onValueChange?: ((value: string) => void) | undefined;
    variant?: TabsVariant | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    activation?: "auto" | "manual" | undefined;
    orientation?: "horizontal" | "vertical" | undefined;
}
declare const Tabs: React.FC<TabsProps & React.RefAttributes<HTMLDivElement>>;
type TabListProps = React.HTMLAttributes<HTMLDivElement> & ({
    onAdd: () => void;
    addLabel: string;
} | {
    onAdd?: undefined;
    addLabel?: undefined;
});
declare const TabList: React.FC<TabListProps & React.RefAttributes<HTMLDivElement>>;
interface TabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
    value: string;
    icon?: IconSource | undefined;
    onClose?: (() => void) | undefined;
}
declare const Tab: React.FC<TabProps & React.RefAttributes<HTMLButtonElement>>;
interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    keepMounted?: boolean | undefined;
}
declare const TabPanel: React.FC<TabPanelProps & React.RefAttributes<HTMLDivElement>>;
