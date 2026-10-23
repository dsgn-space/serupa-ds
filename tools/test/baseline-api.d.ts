import * as React from "react";
import { IconData, MaterialIconName } from "./icons.js";
type ThemeBrand = "blue" | "violet" | "emerald";
type ThemeMode = "auto" | "light" | "dark";
interface ThemeInfo {
    brand: ThemeBrand;
    mode: ThemeMode;
    theme: string;
}
interface SerupaTheme {
    get(): ThemeInfo;
    set(choice: {
        brand?: ThemeBrand;
        mode?: ThemeMode;
    }): ThemeInfo;
    reset(): ThemeInfo;
    onChange(fn: (info: ThemeInfo) => void): () => void;
}
interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    type?: "single" | "multiple";
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    collapsible?: boolean;
    variant?: "plain" | "card";
    headingLevel?: 2 | 3 | 4 | 5 | 6;
}
interface AccordionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    value?: string;
    title: React.ReactNode;
    disabled?: boolean;
    children?: React.ReactNode;
}
declare const Accordion: React.ForwardRefExoticComponent<AccordionProps & React.RefAttributes<HTMLDivElement>>;
declare const AccordionItem: React.ForwardRefExoticComponent<AccordionItemProps & React.RefAttributes<HTMLDivElement>>;
type CustomIconName = never;
declare const customIcons: readonly CustomIconName[];
declare function registerIcons(...icons: Array<IconData | Readonly<Record<string, IconData>>>): void;
declare function getIcon(name: string): IconData | undefined;
type IconName = CustomIconName | MaterialIconName | (string & {});
type IconSource = IconName | IconData | React.ReactNode;
interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
    name?: IconName;
    icon?: IconData;
    size?: number | string;
}
declare const Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<HTMLSpanElement>>;
type AlertTone = "info" | "success" | "warning" | "danger" | "neutral";
interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    tone?: AlertTone;
    title?: React.ReactNode;
    icon?: IconSource | false;
    actions?: React.ReactNode;
    onDismiss?: () => void;
    dismissLabel?: string;
}
declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarStatus = "online" | "busy" | "away" | "offline";
interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
    src?: string;
    name?: string;
    alt?: string;
    size?: AvatarSize;
    shape?: "circle" | "square";
    status?: AvatarStatus;
    statusLabel?: string;
}
declare function initials(name?: string): string;
declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLSpanElement>>;
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    max?: number;
    total?: number;
    size?: AvatarSize;
    moreLabel?: (count: number) => string;
    label?: string;
}
declare const AvatarGroup: React.ForwardRefExoticComponent<AvatarGroupProps & React.RefAttributes<HTMLDivElement>>;
type BadgeVariant = "subtle" | "solid" | "outline";
type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info" | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose";
interface BadgeProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
    variant?: BadgeVariant;
    tone?: BadgeTone;
    size?: never;
    dot?: boolean;
    ping?: boolean;
    leftIcon?: IconSource;
    count?: number;
    max?: number;
    showZero?: boolean;
    onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    removeLabel?: string;
    onClick?: React.MouseEventHandler<HTMLElement>;
    href?: string;
    target?: string;
    rel?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    loading?: boolean;
    loadingText?: string;
}
declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLElement>>;
interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
    separator?: "chevron" | "slash";
    maxItems?: number;
    "aria-label"?: string;
    expandLabel?: string;
}
interface BreadcrumbItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href?: string;
    icon?: IconSource;
    as?: React.ElementType;
    current?: boolean;
}
declare const BreadcrumbItem: React.ForwardRefExoticComponent<BreadcrumbItemProps & React.RefAttributes<HTMLAnchorElement>>;
declare const Breadcrumb: React.ForwardRefExoticComponent<BreadcrumbProps & React.RefAttributes<HTMLElement>>;
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";
interface ButtonOwnProps {
    variant?: ButtonVariant;
    destructive?: boolean;
    size?: ButtonSize;
    leftIcon?: IconSource;
    rightIcon?: IconSource;
    icon?: IconSource;
    loading?: boolean;
    loadingText?: string;
}
interface ButtonAsButtonProps extends ButtonOwnProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
    href?: undefined;
    type?: "button" | "submit" | "reset";
    popoverTarget?: string;
    popoverTargetAction?: "show" | "hide" | "toggle";
    commandfor?: string;
    command?: string;
}
interface ButtonAsLinkProps extends ButtonOwnProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "type"> {
    href: string;
    disabled?: boolean;
}
type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;
declare function buttonClass(opts?: {
    variant?: ButtonVariant;
    destructive?: boolean;
    size?: ButtonSize;
    iconOnly?: boolean;
    iconPosition?: "left" | "right";
    className?: string;
}): string;
declare const Button: {
    (props: ButtonAsButtonProps & React.RefAttributes<HTMLButtonElement>): React.ReactElement | null;
    (props: ButtonAsLinkProps & React.RefAttributes<HTMLAnchorElement>): React.ReactElement | null;
    displayName?: string;
};
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    attached?: boolean;
    orientation?: "horizontal" | "vertical";
    "aria-label"?: string;
}
declare const ButtonGroup: React.ForwardRefExoticComponent<ButtonGroupProps & React.RefAttributes<HTMLDivElement>>;
interface CarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
    children?: React.ReactNode;
    label: string;
    index?: number;
    defaultIndex?: number;
    onIndexChange?: (index: number) => void;
    loop?: boolean;
    arrows?: boolean;
    dots?: boolean;
    previousLabel?: string;
    nextLabel?: string;
    slideLabel?: (index: number, count: number) => string;
}
declare const Carousel: React.ForwardRefExoticComponent<CarouselProps & React.RefAttributes<HTMLElement>>;
interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date) => void;
    month?: Date;
    defaultMonth?: Date;
    onMonthChange?: (month: Date) => void;
    min?: Date;
    max?: Date;
    isDateDisabled?: (date: Date) => boolean;
    locale?: string;
    weekStartsOn?: number;
    autoFocus?: boolean;
    previousLabel?: string;
    nextLabel?: string;
    dayClassName?: (date: Date) => string | undefined;
    isDateSelected?: (date: Date) => boolean;
    onDayHover?: (date: Date) => void;
    hideOutside?: boolean;
}
declare const Calendar: React.ForwardRefExoticComponent<CalendarProps & React.RefAttributes<HTMLDivElement>>;
type CardVariant = "outline" | "elevated" | "filled";
type CardPadding = "none" | "sm" | "md" | "lg";
interface CardProps extends React.HTMLAttributes<HTMLElement> {
    variant?: CardVariant;
    padding?: CardPadding;
    as?: "div" | "section" | "article" | "li";
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
    justify?: "start" | "end" | "between";
}
declare const CardFooter: React.ForwardRefExoticComponent<CardFooterProps & React.RefAttributes<HTMLDivElement>>;
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    size?: "sm" | "md" | "lg";
    children?: React.ReactNode;
    description?: React.ReactNode;
    indeterminate?: boolean;
    invalid?: boolean;
}
declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    size?: "sm" | "md" | "lg";
    invalid?: boolean;
    leftIcon?: IconSource;
    rightIcon?: IconSource;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
type ComboboxOption = string | {
    value: string;
    label: string;
    description?: React.ReactNode;
    disabled?: boolean;
};
interface ComboboxProps extends Omit<InputProps, "type" | "value" | "defaultValue" | "rightIcon" | "onChange"> {
    options: ComboboxOption[];
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
    onInputChange?: (text: string) => void;
    filter?: false | ((option: {
        value: string;
        label: string;
    }, text: string) => boolean);
    clearable?: boolean;
    loading?: boolean;
    emptyText?: React.ReactNode;
    loadingText?: string;
    toggleLabel?: string;
    clearLabel?: string;
}
declare const Combobox: React.ForwardRefExoticComponent<ComboboxProps & React.RefAttributes<HTMLInputElement>>;
type ContainerSize = "prose" | "md" | "lg" | "xl" | "2xl" | "full";
interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
    size?: ContainerSize;
    padded?: boolean;
    as?: "div" | "main" | "section" | "header" | "footer" | "article";
}
declare const Container: React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLElement>>;
interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange" | "min" | "max"> {
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date | null) => void;
    min?: Date;
    max?: Date;
    isDateDisabled?: (date: Date) => boolean;
    locale?: string;
    weekStartsOn?: number;
    size?: "sm" | "md" | "lg";
    invalid?: boolean;
    buttonLabel?: string;
}
declare const DatePicker: React.ForwardRefExoticComponent<DatePickerProps & React.RefAttributes<HTMLInputElement>>;
interface DateRange {
    start: Date | null;
    end: Date | null;
}
interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "defaultValue" | "onChange"> {
    value?: DateRange;
    defaultValue?: DateRange;
    onValueChange?: (value: DateRange) => void;
    min?: Date;
    max?: Date;
    isDateDisabled?: (date: Date) => boolean;
    locale?: string;
    weekStartsOn?: number;
    size?: "sm" | "md" | "lg";
    invalid?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    id?: string;
    startLabel?: string;
    endLabel?: string;
    startName?: string;
    endName?: string;
    buttonLabel?: string;
    months?: 1 | 2;
}
declare const DateRangePicker: React.ForwardRefExoticComponent<DateRangePickerProps & React.RefAttributes<HTMLSpanElement>>;
interface DialogProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "title" | "open"> {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg";
    alert?: boolean;
    closeButton?: boolean;
    closeLabel?: string;
    closeOnBackdrop?: boolean;
}
declare const Dialog: React.ForwardRefExoticComponent<DialogProps & React.RefAttributes<HTMLDialogElement>>;
interface DividerProps extends React.HTMLAttributes<HTMLElement> {
    orientation?: "horizontal" | "vertical";
    label?: React.ReactNode;
    decorative?: boolean;
}
declare const Divider: React.ForwardRefExoticComponent<DividerProps & React.RefAttributes<HTMLElement>>;
interface DrawerProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "title" | "open"> {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: "right" | "left" | "top" | "bottom";
    size?: "sm" | "md" | "lg";
    title?: React.ReactNode;
    description?: React.ReactNode;
    footer?: React.ReactNode;
    closeButton?: boolean;
    closeLabel?: string;
    closeOnBackdrop?: boolean;
}
declare const Drawer: React.ForwardRefExoticComponent<DrawerProps & React.RefAttributes<HTMLDialogElement>>;
interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    icon?: IconSource;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    size?: "sm" | "md";
    variant?: "plain" | "dashed";
    headingLevel?: 2 | 3 | 4 | 5 | 6;
}
declare const EmptyState: React.ForwardRefExoticComponent<EmptyStateProps & React.RefAttributes<HTMLDivElement>>;
type FabPosition = "bottom-end" | "bottom-start" | "top-end" | "top-start" | "static";
interface FabProps extends Omit<ButtonAsButtonProps, "icon" | "leftIcon" | "rightIcon" | "children" | "variant" | "size" | "aria-label"> {
    icon: IconSource;
    label: string;
    extended?: boolean;
    size?: "sm" | "md";
    position?: FabPosition;
}
declare const Fab: React.ForwardRefExoticComponent<FabProps & React.RefAttributes<HTMLButtonElement>>;
interface FieldProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    required?: boolean;
    optional?: boolean | string;
    disabled?: boolean;
    group?: boolean;
    id?: string;
    children?: React.ReactNode;
}
declare const Field: ((props: FieldProps) => React.ReactElement) & {
    displayName: string;
};
type FileRejection = {
    file: File;
    reason: "type" | "size" | "count";
    message: string;
};
interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "title"> {
    files?: File[];
    onFilesChange?: (files: File[]) => void;
    onReject?: (rejections: FileRejection[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    disabled?: boolean;
    name?: string;
    title?: React.ReactNode;
    buttonLabel?: string;
    hint?: React.ReactNode;
    removeLabel?: (name: string) => string;
}
declare function formatFileSize(bytes: number): string;
declare const FileUpload: React.ForwardRefExoticComponent<FileUploadProps & React.RefAttributes<HTMLDivElement>>;
type Space = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 20 | 24;
interface GridProps extends React.HTMLAttributes<HTMLElement> {
    columns?: number | "auto";
    minColumnWidth?: string;
    gap?: Space;
    as?: "div" | "section" | "ul" | "ol";
}
declare const Grid: React.ForwardRefExoticComponent<GridProps & React.RefAttributes<HTMLElement>>;
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: HeadingLevel;
    size?: HeadingSize;
}
declare const Heading: React.ForwardRefExoticComponent<HeadingProps & React.RefAttributes<HTMLHeadingElement>>;
type Without<T> = T extends unknown ? Omit<T, "icon" | "leftIcon" | "rightIcon" | "children" | "aria-label"> : never;
interface IconButtonOwnProps {
    icon: IconSource;
    label: string;
    shape?: "square" | "round";
    noTitle?: boolean;
}
type IconButtonProps = Without<ButtonAsButtonProps> & IconButtonOwnProps | Without<ButtonAsLinkProps> & IconButtonOwnProps;
declare const IconButton: React.ForwardRefExoticComponent<IconButtonProps & React.RefAttributes<HTMLAnchorElement | HTMLButtonElement>>;
type ImageRatio = "auto" | "square" | "4:3" | "video" | number;
interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "alt" | "src" | "placeholder"> {
    src: string;
    alt: string;
    ratio?: ImageRatio;
    fit?: "cover" | "contain";
    rounded?: boolean;
    fallback?: React.ReactNode;
    viewable?: boolean;
    fullSrc?: string;
    viewLabel?: string;
    onRemove?: () => void;
    removeLabel?: string;
    frameProps?: React.HTMLAttributes<HTMLSpanElement>;
}
declare const Image: React.ForwardRefExoticComponent<ImageProps & React.RefAttributes<HTMLImageElement>>;
interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
    children?: React.ReactNode;
    variant?: "plain" | "card";
    divided?: boolean;
    as?: "ul" | "ol";
}
interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title" | "onClick"> {
    title: React.ReactNode;
    description?: React.ReactNode;
    leading?: IconSource;
    trailing?: React.ReactNode;
    href?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    as?: React.ElementType;
    linkProps?: Record<string, unknown>;
    selected?: boolean;
    disabled?: boolean;
}
declare const List: React.ForwardRefExoticComponent<ListProps & React.RefAttributes<HTMLUListElement>>;
declare const ListItem: React.ForwardRefExoticComponent<ListItemProps & React.RefAttributes<HTMLLIElement>>;
type LoaderVariant = "ring" | "spokes" | "dots" | "pixel" | "text" | "skeleton";
type LoaderShape = "text" | "circle" | "rect";
type LoaderPattern = "wave" | "random" | "sweep" | "fall" | "rise" | "snake" | "spiral" | "cross" | "checker";
type LoaderTone = "neutral" | "primary" | "muted" | "inverse";
interface LoaderProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: LoaderVariant;
    size?: "sm" | "md" | "lg";
    tone?: LoaderTone;
    label?: string;
    shape?: LoaderShape;
    lines?: number;
    pattern?: LoaderPattern;
    glow?: boolean;
    delay?: number;
}
declare const Loader: React.ForwardRefExoticComponent<LoaderProps & React.RefAttributes<HTMLSpanElement>>;
interface KbdProps extends React.HTMLAttributes<HTMLElement> {
    keys?: string[];
    size?: "sm" | "md";
}
declare const Kbd: React.ForwardRefExoticComponent<KbdProps & React.RefAttributes<HTMLElement>>;
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    tone?: "primary" | "neutral";
    underline?: "always" | "hover";
    external?: boolean;
    as?: React.ElementType;
}
declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
type Side = "top" | "bottom" | "left" | "right";
type Placement = Side | `${Side}-${"start" | "end"}`;
interface MenuProps {
    trigger: React.ReactElement;
    children: React.ReactNode;
    placement?: Placement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    "aria-label"?: string;
    className?: string;
    style?: React.CSSProperties;
}
declare const Menu: ((props: MenuProps) => React.ReactElement) & {
    displayName: string;
};
interface MenuItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
    onSelect?: (event: React.SyntheticEvent) => void;
    icon?: IconSource;
    shortcut?: string;
    destructive?: boolean;
    disabled?: boolean;
    href?: string;
    target?: string;
    rel?: string;
}
declare const MenuItem: React.ForwardRefExoticComponent<MenuItemProps & React.RefAttributes<HTMLElement>>;
interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: React.ReactNode;
}
declare const MenuGroup: React.ForwardRefExoticComponent<MenuGroupProps & React.RefAttributes<HTMLDivElement>>;
declare const MenuSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
    brand?: React.ReactNode;
    children?: React.ReactNode;
    actions?: React.ReactNode;
    sticky?: boolean;
    size?: ContainerSize;
    "aria-label"?: string;
    menuLabel?: string;
}
interface NavbarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    active?: boolean;
    as?: React.ElementType;
}
declare const Navbar: React.ForwardRefExoticComponent<NavbarProps & React.RefAttributes<HTMLElement>>;
declare const NavbarLink: React.ForwardRefExoticComponent<NavbarLinkProps & React.RefAttributes<HTMLAnchorElement>>;
interface NumberInputProps extends Omit<InputProps, "type" | "value" | "defaultValue" | "rightIcon" | "min" | "max" | "step"> {
    value?: number | null;
    defaultValue?: number | null;
    onValueChange?: (value: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    largeStep?: number;
    steppers?: boolean;
    decrementLabel?: string;
    incrementLabel?: string;
}
declare const NumberInput: React.ForwardRefExoticComponent<NumberInputProps & React.RefAttributes<HTMLInputElement>>;
interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
    count: number;
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    getHref?: (page: number) => string;
    siblings?: number;
    boundaries?: number;
    size?: "sm" | "md";
    "aria-label"?: string;
    previousLabel?: string;
    nextLabel?: string;
    pageLabel?: (page: number) => string;
}
type Entry = number | "start-ellipsis" | "end-ellipsis";
declare function paginationRange(page: number, count: number, siblings?: number, boundaries?: number): Entry[];
declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLElement>>;
interface PasswordInputProps extends Omit<InputProps, "type" | "rightIcon"> {
    visible?: boolean;
    defaultVisible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    toggleLabel?: string;
}
declare const PasswordInput: React.ForwardRefExoticComponent<PasswordInputProps & React.RefAttributes<HTMLInputElement>>;
interface PopoverProps {
    trigger: React.ReactElement;
    children: React.ReactNode | ((close: () => void) => React.ReactNode);
    title?: React.ReactNode;
    placement?: Placement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    "aria-label"?: string;
    initialFocus?: "first" | "panel";
    className?: string;
    style?: React.CSSProperties;
}
declare const Popover: ((props: PopoverProps) => React.ReactElement) & {
    displayName: string;
};
type ProgressTone = "primary" | "success" | "warning" | "danger";
interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    value?: number | null;
    max?: number;
    variant?: "bar" | "circle";
    size?: "sm" | "md" | "lg";
    tone?: ProgressTone;
    label?: React.ReactNode;
    showValue?: boolean;
    formatValue?: (value: number, max: number) => string;
}
declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
interface RadioGroupProps<V extends string | number = string | number> extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
    name?: string;
    value?: V | null;
    defaultValue?: V;
    onChange?: (value: V, event: React.ChangeEvent<HTMLInputElement>) => void;
    orientation?: "vertical" | "horizontal";
    size?: "sm" | "md" | "lg";
    invalid?: boolean;
    disabled?: boolean;
    required?: boolean;
    children?: React.ReactNode;
}
interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    size?: "sm" | "md" | "lg";
    children?: React.ReactNode;
    description?: React.ReactNode;
    invalid?: boolean;
}
declare const RadioGroup: (<V extends string | number = string | number>(props: RadioGroupProps<V> & React.RefAttributes<HTMLDivElement>) => React.ReactElement | null) & {
    displayName?: string;
};
declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
interface SearchInputProps extends Omit<InputProps, "type" | "leftIcon" | "rightIcon"> {
    onSearch?: (value: string) => void;
    onClear?: () => void;
    clearLabel?: string;
    loading?: boolean;
    loadingLabel?: string;
}
declare const SearchInput: React.ForwardRefExoticComponent<SearchInputProps & React.RefAttributes<HTMLInputElement>>;
interface SegmentedControlOption {
    value: string;
    label?: React.ReactNode;
    icon?: IconSource;
    "aria-label"?: string;
    disabled?: boolean;
}
interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
    options: SegmentedControlOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: "sm" | "md";
    fullWidth?: boolean;
    disabled?: boolean;
    name?: string;
}
declare const SegmentedControl: React.ForwardRefExoticComponent<SegmentedControlProps & React.RefAttributes<HTMLDivElement>>;
type SelectOption = string | number | {
    value: string | number;
    label?: React.ReactNode;
    disabled?: boolean;
};
interface SelectOptionGroup {
    label: string;
    options: SelectOption[];
    disabled?: boolean;
}
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "multiple"> {
    size?: "sm" | "md" | "lg";
    invalid?: boolean;
    leftIcon?: IconSource;
    placeholder?: string;
    options?: Array<SelectOption | SelectOptionGroup>;
}
declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    collapsed?: boolean;
    "aria-label"?: string;
}
interface SidebarSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    title?: React.ReactNode;
    children?: React.ReactNode;
}
interface SidebarItemProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
    label: React.ReactNode;
    icon?: IconSource;
    active?: boolean;
    badge?: React.ReactNode;
    children?: React.ReactNode;
    defaultOpen?: boolean;
    as?: React.ElementType;
}
declare const Sidebar: React.ForwardRefExoticComponent<SidebarProps & React.RefAttributes<HTMLElement>>;
declare const SidebarSection: React.ForwardRefExoticComponent<SidebarSectionProps & React.RefAttributes<HTMLDivElement>>;
declare const SidebarItem: React.ForwardRefExoticComponent<SidebarItemProps & React.RefAttributes<HTMLAnchorElement>>;
type SliderValue = number | [
    number,
    number
];
interface SliderProps<V extends SliderValue = SliderValue> extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: V;
    defaultValue?: V;
    onValueChange?: (value: V) => void;
    onValueCommit?: (value: V) => void;
    min?: number;
    max?: number;
    step?: number;
    largeStep?: number;
    size?: "sm" | "md";
    disabled?: boolean;
    formatValue?: (value: number) => string;
    thumbLabels?: [
        string,
        string
    ];
    name?: string;
}
declare const Slider: (<V extends SliderValue = SliderValue>(props: SliderProps<V> & React.RefAttributes<HTMLDivElement>) => React.ReactElement | null) & {
    displayName?: string;
};
interface StackProps extends React.HTMLAttributes<HTMLElement> {
    direction?: "column" | "row";
    gap?: Space;
    align?: "stretch" | "start" | "center" | "end" | "baseline";
    justify?: "start" | "center" | "end" | "between";
    wrap?: boolean;
    as?: "div" | "section" | "ul" | "ol" | "nav" | "header" | "footer" | "form" | "fieldset" | "span";
}
declare const Stack: React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLElement>>;
interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
    focusable?: boolean;
    as?: "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "label" | "legend";
}
declare const VisuallyHidden: React.ForwardRefExoticComponent<VisuallyHiddenProps & React.RefAttributes<HTMLElement>>;
interface StepperStep {
    title: React.ReactNode;
    description?: React.ReactNode;
    optional?: boolean;
    status?: "error";
}
interface StepperProps extends React.HTMLAttributes<HTMLElement> {
    steps: StepperStep[];
    current: number;
    orientation?: "horizontal" | "vertical";
    size?: "sm" | "md";
    onStepClick?: (index: number) => void;
    labels?: {
        completed?: string;
        error?: string;
        optional?: string;
    };
}
declare const Stepper: React.ForwardRefExoticComponent<StepperProps & React.RefAttributes<HTMLElement>>;
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "role"> {
    size?: "sm" | "md" | "lg";
    children?: React.ReactNode;
    description?: React.ReactNode;
    labelPosition?: "start" | "end";
    invalid?: boolean;
}
declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;
interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    size?: "sm" | "md";
    striped?: boolean;
    stickyHeader?: boolean;
    caption?: React.ReactNode;
    captionHidden?: boolean;
    containerProps?: React.HTMLAttributes<HTMLDivElement>;
}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    selected?: boolean;
}
type SortDirection = "ascending" | "descending" | "none";
interface TableHeaderCellProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> {
    align?: "start" | "center" | "end";
    sort?: SortDirection;
    onSort?: () => void;
}
interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
    align?: "start" | "center" | "end";
}
declare const Table: React.ForwardRefExoticComponent<TableProps & React.RefAttributes<HTMLTableElement>>;
declare const TableHead: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
declare const TableBody: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
declare const TableFoot: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
declare const TableRow: React.ForwardRefExoticComponent<TableRowProps & React.RefAttributes<HTMLTableRowElement>>;
declare const TableHeaderCell: React.ForwardRefExoticComponent<TableHeaderCellProps & React.RefAttributes<HTMLTableCellElement>>;
declare const TableCell: React.ForwardRefExoticComponent<TableCellProps & React.RefAttributes<HTMLTableCellElement>>;
type TabsVariant = "line" | "pill";
interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    variant?: TabsVariant;
    size?: "sm" | "md";
    activation?: "auto" | "manual";
}
declare const Tabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>>;
declare const TabList: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
interface TabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
    value: string;
    icon?: IconSource;
}
declare const Tab: React.ForwardRefExoticComponent<TabProps & React.RefAttributes<HTMLButtonElement>>;
interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    keepMounted?: boolean;
}
declare const TabPanel: React.ForwardRefExoticComponent<TabPanelProps & React.RefAttributes<HTMLDivElement>>;
type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
type TextTone = "default" | "muted" | "primary" | "danger";
type TextWeight = "normal" | "medium" | "semibold" | "bold";
interface TextProps extends React.HTMLAttributes<HTMLElement> {
    as?: "p" | "span" | "div" | "label" | "strong" | "em" | "small" | "li" | "figcaption";
    size?: TextSize;
    tone?: TextTone;
    weight?: TextWeight;
    truncate?: boolean;
    htmlFor?: string;
}
declare const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<HTMLElement>>;
interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> {
    size?: "sm" | "md" | "lg";
    rows?: number;
    autoResize?: boolean;
    maxRows?: number;
    resize?: "vertical" | "none";
    invalid?: boolean;
    showCount?: boolean;
}
declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"> {
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
    min?: string;
    max?: string;
    step?: number;
    locale?: string;
    hour12?: boolean;
    size?: "sm" | "md" | "lg";
    invalid?: boolean;
    listLabel?: string;
}
declare const TimePicker: React.ForwardRefExoticComponent<TimePickerProps & React.RefAttributes<HTMLInputElement>>;
type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";
type ToasterPosition = "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end";
interface ToastOptions {
    title: React.ReactNode;
    description?: React.ReactNode;
    tone?: ToastTone;
    action?: {
        label: string;
        onClick: () => void;
    };
    duration?: number;
    announcement?: string;
    id?: string;
}
declare function show(options: ToastOptions | string): string;
declare function dismiss(id?: string): void;
declare const toast: typeof show & {
    dismiss: typeof dismiss;
};
interface ToasterProps extends React.HTMLAttributes<HTMLElement> {
    position?: ToasterPosition;
    label?: string;
    dismissLabel?: string;
}
declare const Toaster: ((props: ToasterProps) => React.ReactElement) & {
    displayName: string;
};
interface ToggleButtonProps extends Omit<ButtonAsButtonProps, "variant" | "destructive" | "loading" | "loadingText"> {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    variant?: "outline" | "ghost";
}
declare const ToggleButton: React.ForwardRefExoticComponent<ToggleButtonProps & React.RefAttributes<HTMLButtonElement>>;
interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement;
    placement?: Placement;
    delay?: number;
    role?: "description" | "label";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
declare const Tooltip: ((props: TooltipProps) => React.ReactElement) & {
    displayName: string;
};
interface SerupaConfig {
    link?: React.ElementType;
}
declare function configure(opts?: SerupaConfig): Required<SerupaConfig>;
declare const version: string;
type ThemeApi = SerupaTheme;
declare global {
    interface Window {
        Serupa: {
            version: string;
            Accordion: typeof Accordion;
            AccordionItem: typeof AccordionItem;
            Alert: typeof Alert;
            Avatar: typeof Avatar;
            AvatarGroup: typeof AvatarGroup;
            Badge: typeof Badge;
            Breadcrumb: typeof Breadcrumb;
            BreadcrumbItem: typeof BreadcrumbItem;
            Button: typeof Button;
            buttonClass: typeof buttonClass;
            ButtonGroup: typeof ButtonGroup;
            Card: typeof Card;
            CardBody: typeof CardBody;
            CardFooter: typeof CardFooter;
            CardHeader: typeof CardHeader;
            Calendar: typeof Calendar;
            Carousel: typeof Carousel;
            Checkbox: typeof Checkbox;
            Combobox: typeof Combobox;
            configure: typeof configure;
            Container: typeof Container;
            customIcons: typeof customIcons;
            registerIcons: typeof registerIcons;
            getIcon: typeof getIcon;
            DatePicker: typeof DatePicker;
            DateRangePicker: typeof DateRangePicker;
            Dialog: typeof Dialog;
            Divider: typeof Divider;
            Drawer: typeof Drawer;
            EmptyState: typeof EmptyState;
            Fab: typeof Fab;
            Field: typeof Field;
            FileUpload: typeof FileUpload;
            formatFileSize: typeof formatFileSize;
            Grid: typeof Grid;
            Heading: typeof Heading;
            Icon: typeof Icon;
            IconButton: typeof IconButton;
            Image: typeof Image;
            initials: typeof initials;
            Input: typeof Input;
            Kbd: typeof Kbd;
            Link: typeof Link;
            List: typeof List;
            ListItem: typeof ListItem;
            Loader: typeof Loader;
            Menu: typeof Menu;
            MenuGroup: typeof MenuGroup;
            MenuItem: typeof MenuItem;
            MenuSeparator: typeof MenuSeparator;
            Navbar: typeof Navbar;
            NavbarLink: typeof NavbarLink;
            NumberInput: typeof NumberInput;
            Pagination: typeof Pagination;
            paginationRange: typeof paginationRange;
            PasswordInput: typeof PasswordInput;
            Popover: typeof Popover;
            Progress: typeof Progress;
            Radio: typeof Radio;
            RadioGroup: typeof RadioGroup;
            SearchInput: typeof SearchInput;
            SegmentedControl: typeof SegmentedControl;
            Select: typeof Select;
            Sidebar: typeof Sidebar;
            SidebarItem: typeof SidebarItem;
            SidebarSection: typeof SidebarSection;
            Slider: typeof Slider;
            Stack: typeof Stack;
            Stepper: typeof Stepper;
            Switch: typeof Switch;
            Tab: typeof Tab;
            Table: typeof Table;
            TableBody: typeof TableBody;
            TableCell: typeof TableCell;
            TableFoot: typeof TableFoot;
            TableHead: typeof TableHead;
            TableHeaderCell: typeof TableHeaderCell;
            TableRow: typeof TableRow;
            TabList: typeof TabList;
            TabPanel: typeof TabPanel;
            Tabs: typeof Tabs;
            Text: typeof Text;
            Textarea: typeof Textarea;
            TimePicker: typeof TimePicker;
            toast: typeof toast;
            Toaster: typeof Toaster;
            ToggleButton: typeof ToggleButton;
            Tooltip: typeof Tooltip;
            VisuallyHidden: typeof VisuallyHidden;
            theme?: ThemeApi;
        };
    }
}
export { Accordion, AccordionItem, Alert, Avatar, AvatarGroup, Badge, Breadcrumb, BreadcrumbItem, Button, ButtonGroup, Calendar, Card, CardBody, CardFooter, CardHeader, Carousel, Checkbox, Combobox, Container, DatePicker, DateRangePicker, Dialog, Divider, Drawer, EmptyState, Fab, Field, FileUpload, Grid, Heading, Icon, IconButton, IconData, Image, Input, Kbd, Link, List, ListItem, Loader, MaterialIconName, Menu, MenuGroup, MenuItem, MenuSeparator, Navbar, NavbarLink, NumberInput, Pagination, PasswordInput, Popover, Progress, Radio, RadioGroup, SearchInput, SegmentedControl, Select, Sidebar, SidebarItem, SidebarSection, Slider, Stack, Stepper, Switch, Tab, TabList, TabPanel, Table, TableBody, TableCell, TableFoot, TableHead, TableHeaderCell, TableRow, Tabs, Text, Textarea, TimePicker, Toaster, ToggleButton, Tooltip, VisuallyHidden, buttonClass, configure, customIcons, formatFileSize, getIcon, initials, paginationRange, registerIcons, toast, version };
export type { AccordionItemProps, AccordionProps, AlertProps, AlertTone, AvatarGroupProps, AvatarProps, AvatarSize, AvatarStatus, BadgeProps, BadgeTone, BadgeVariant, BreadcrumbItemProps, BreadcrumbProps, ButtonAsButtonProps, ButtonAsLinkProps, ButtonGroupProps, ButtonProps, ButtonSize, ButtonVariant, CalendarProps, CardBodyProps, CardFooterProps, CardHeaderProps, CardPadding, CardProps, CardVariant, CarouselProps, CheckboxProps, ComboboxOption, ComboboxProps, ContainerProps, ContainerSize, CustomIconName, DatePickerProps, DateRange, DateRangePickerProps, DialogProps, DividerProps, DrawerProps, EmptyStateProps, FabPosition, FabProps, FieldProps, FileRejection, FileUploadProps, GridProps, HeadingLevel, HeadingProps, HeadingSize, IconButtonProps, IconName, IconProps, IconSource, ImageProps, ImageRatio, InputProps, KbdProps, LinkProps, ListItemProps, ListProps, LoaderPattern, LoaderProps, LoaderShape, LoaderTone, LoaderVariant, MenuGroupProps, MenuItemProps, MenuProps, NavbarLinkProps, NavbarProps, NumberInputProps, PaginationProps, PasswordInputProps, Placement, PopoverProps, ProgressProps, ProgressTone, RadioGroupProps, RadioProps, SearchInputProps, SegmentedControlOption, SegmentedControlProps, SelectOption, SelectOptionGroup, SelectProps, SerupaConfig, SerupaTheme, SidebarItemProps, SidebarProps, SidebarSectionProps, SliderProps, SliderValue, SortDirection, Space, StackProps, StepperProps, StepperStep, SwitchProps, TabPanelProps, TabProps, TableCellProps, TableHeaderCellProps, TableProps, TableRowProps, TabsProps, TabsVariant, TextProps, TextSize, TextTone, TextWeight, TextareaProps, ThemeBrand, ThemeInfo, ThemeMode, TimePickerProps, ToastOptions, ToastTone, ToasterPosition, ToasterProps, ToggleButtonProps, TooltipProps, VisuallyHiddenProps };
