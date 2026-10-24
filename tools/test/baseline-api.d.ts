import * as React from "react";
import { IconData, MaterialIconName } from "./icons.js";
type ThemeBrand = "blue" | "emerald" | "violet";
type ThemeMode = "auto" | "dark" | "light";
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
    type?: "multiple" | "single";
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    collapsible?: boolean;
    variant?: "card" | "plain";
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
type IconName = (string & {}) | CustomIconName | MaterialIconName;
type IconSource = IconData | IconName | React.ReactNode;
interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
    name?: IconName;
    icon?: IconData;
    size?: number | string;
}
declare const Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<HTMLSpanElement>>;
type AlertTone = "danger" | "info" | "neutral" | "success" | "warning";
interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    tone?: AlertTone;
    title?: React.ReactNode;
    icon?: false | IconSource;
    actions?: React.ReactNode;
    onDismiss?: () => void;
    dismissLabel?: string;
}
declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
declare function initials(name?: string): string;
type AvatarSize = "lg" | "md" | "sm" | "xl" | "xs";
type AvatarStatus = "away" | "busy" | "offline" | "online";
interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
    src?: string;
    name?: string;
    alt?: string;
    size?: AvatarSize;
    shape?: "circle" | "square";
    status?: AvatarStatus;
    statusLabel?: string;
}
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
type BadgeVariant = "outline" | "solid" | "subtle";
type BadgeTone = "amber" | "blue" | "cyan" | "danger" | "emerald" | "fuchsia" | "green" | "indigo" | "info" | "lime" | "neutral" | "orange" | "pink" | "primary" | "purple" | "red" | "rose" | "sky" | "success" | "teal" | "violet" | "warning" | "yellow";
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
    type?: "button" | "reset" | "submit";
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
declare function buttonClass(opts?: {
    variant?: ButtonVariant;
    destructive?: boolean;
    size?: ButtonSize;
    iconOnly?: boolean;
    iconPosition?: "left" | "right";
    className?: string;
}): string;
type ButtonVariant = "ghost" | "link" | "outline" | "primary" | "secondary";
type ButtonSize = "lg" | "md" | "sm";
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
    type?: "button" | "reset" | "submit";
    popoverTarget?: string;
    popoverTargetAction?: "hide" | "show" | "toggle";
    commandfor?: string;
    command?: string;
}
interface ButtonAsLinkProps extends ButtonOwnProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "type"> {
    href: string;
    disabled?: boolean;
}
type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;
declare const Button: {
    (props: ButtonAsButtonProps & React.RefAttributes<HTMLButtonElement>): null | React.ReactElement;
    (props: ButtonAsLinkProps & React.RefAttributes<HTMLAnchorElement>): null | React.ReactElement;
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
interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
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
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    size?: "lg" | "md" | "sm";
    children?: React.ReactNode;
    description?: React.ReactNode;
    indeterminate?: boolean;
    invalid?: boolean;
    readOnly?: boolean;
}
declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    size?: "lg" | "md" | "sm";
    invalid?: boolean;
    leftIcon?: IconSource;
    rightIcon?: IconSource;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
type ComboboxOption = {
    value: string;
    label: string;
    description?: React.ReactNode;
    disabled?: boolean;
} | string;
interface ComboboxProps extends Omit<InputProps, "defaultValue" | "onChange" | "rightIcon" | "type" | "value"> {
    options: ComboboxOption[];
    value?: null | string;
    defaultValue?: null | string;
    onValueChange?: (value: null | string) => void;
    onInputChange?: (text: string) => void;
    filter?: ((option: {
        value: string;
        label: string;
    }, text: string) => boolean) | false;
    clearable?: boolean;
    loading?: boolean;
    emptyText?: React.ReactNode;
    loadingText?: string;
    toggleLabel?: string;
    clearLabel?: string;
}
declare const Combobox: React.ForwardRefExoticComponent<ComboboxProps & React.RefAttributes<HTMLInputElement>>;
type ContainerSize = "2xl" | "full" | "lg" | "md" | "prose" | "xl";
interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
    size?: ContainerSize;
    padded?: boolean;
    as?: "article" | "div" | "footer" | "header" | "main" | "section";
}
declare const Container: React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLElement>>;
interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "max" | "min" | "onChange" | "size" | "value"> {
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date | null) => void;
    min?: Date;
    max?: Date;
    isDateDisabled?: (date: Date) => boolean;
    locale?: string;
    weekStartsOn?: number;
    size?: "lg" | "md" | "sm";
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
    size?: "lg" | "md" | "sm";
    invalid?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    id?: string;
    startLabel?: string;
    endLabel?: string;
    startName?: string;
    endName?: string;
    buttonLabel?: string;
    months?: 1 | 2;
}
declare const DateRangePicker: React.ForwardRefExoticComponent<DateRangePickerProps & React.RefAttributes<HTMLSpanElement>>;
interface DialogProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "title"> {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    footer?: React.ReactNode;
    size?: "lg" | "md" | "sm";
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
interface DrawerProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "title"> {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: "bottom" | "left" | "right" | "top";
    size?: "lg" | "md" | "sm";
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
    size?: "md" | "sm";
    variant?: "dashed" | "plain";
    headingLevel?: 2 | 3 | 4 | 5 | 6;
}
declare const EmptyState: React.ForwardRefExoticComponent<EmptyStateProps & React.RefAttributes<HTMLDivElement>>;
type FabPosition = "bottom-end" | "bottom-start" | "static" | "top-end" | "top-start";
interface FabProps extends Omit<ButtonAsButtonProps, "aria-label" | "children" | "icon" | "leftIcon" | "rightIcon" | "size" | "variant"> {
    icon: IconSource;
    label: string;
    extended?: boolean;
    size?: "md" | "sm";
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
declare function formatFileSize(bytes: number): string;
type FileRejection = {
    file: File;
    reason: "count" | "size" | "type";
    message: string;
};
interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "title"> {
    files?: File[];
    onFilesChange?: (files: File[]) => void;
    onReject?: (rejections: FileRejection[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    readOnly?: boolean;
    name?: string;
    title?: React.ReactNode;
    buttonLabel?: string;
    hint?: React.ReactNode;
    removeLabel?: (name: string) => string;
}
declare const FileUpload: React.ForwardRefExoticComponent<FileUploadProps & React.RefAttributes<HTMLDivElement>>;
type Space = 0 | 0.5 | 1 | 1.5 | 10 | 11 | 12 | 14 | 16 | 2 | 2.5 | 20 | 24 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9;
interface GridProps extends React.HTMLAttributes<HTMLElement> {
    columns?: "auto" | number;
    minColumnWidth?: string;
    gap?: Space;
    as?: "div" | "ol" | "section" | "ul";
}
declare const Grid: React.ForwardRefExoticComponent<GridProps & React.RefAttributes<HTMLElement>>;
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "2xl" | "3xl" | "4xl" | "5xl" | "base" | "lg" | "sm" | "xl";
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: HeadingLevel;
    size?: HeadingSize;
}
declare const Heading: React.ForwardRefExoticComponent<HeadingProps & React.RefAttributes<HTMLHeadingElement>>;
type Without<T> = T extends unknown ? Omit<T, "aria-label" | "children" | "icon" | "leftIcon" | "rightIcon"> : never;
interface IconButtonOwnProps {
    icon: IconSource;
    label: string;
    shape?: "round" | "square";
    noTitle?: boolean;
}
type IconButtonProps = (Without<ButtonAsButtonProps> & IconButtonOwnProps) | (Without<ButtonAsLinkProps> & IconButtonOwnProps);
declare const IconButton: React.ForwardRefExoticComponent<IconButtonProps & React.RefAttributes<HTMLAnchorElement | HTMLButtonElement>>;
type ImageRatio = "4:3" | "auto" | "square" | "video" | number;
interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "alt" | "placeholder" | "src"> {
    src: string;
    alt: string;
    ratio?: ImageRatio;
    fit?: "contain" | "cover";
    rounded?: boolean;
    fallback?: React.ReactNode;
    viewable?: boolean;
    fullSrc?: string;
    viewLabel?: string;
    onRemove?: () => void;
    removeLabel?: string;
    priority?: boolean;
    frameProps?: React.HTMLAttributes<HTMLSpanElement>;
}
declare const Image: React.ForwardRefExoticComponent<ImageProps & React.RefAttributes<HTMLImageElement>>;
interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
    children?: React.ReactNode;
    variant?: "card" | "plain";
    divided?: boolean;
    as?: "ol" | "ul";
}
interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "onClick" | "title"> {
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
type LoaderVariant = "dots" | "pixel" | "ring" | "skeleton" | "spokes" | "text";
type LoaderShape = "circle" | "rect" | "text";
type LoaderPattern = "checker" | "cross" | "fall" | "random" | "rise" | "snake" | "spiral" | "sweep" | "wave";
type LoaderTone = "inverse" | "muted" | "neutral" | "primary";
interface LoaderProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: LoaderVariant;
    size?: "lg" | "md" | "sm";
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
    size?: "md" | "sm";
}
declare const Kbd: React.ForwardRefExoticComponent<KbdProps & React.RefAttributes<HTMLElement>>;
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    tone?: "neutral" | "primary";
    underline?: "always" | "hover";
    external?: boolean;
    as?: React.ElementType;
}
declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
type Side = "bottom" | "left" | "right" | "top";
type Placement = `${Side}-${"end" | "start"}` | Side;
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
interface NumberInputProps extends Omit<InputProps, "defaultValue" | "max" | "min" | "rightIcon" | "step" | "type" | "value"> {
    value?: null | number;
    defaultValue?: null | number;
    onValueChange?: (value: null | number) => void;
    min?: number;
    max?: number;
    step?: number;
    largeStep?: number;
    steppers?: boolean;
    decrementLabel?: string;
    incrementLabel?: string;
    locale?: string;
    formatOptions?: Intl.NumberFormatOptions;
    currency?: string;
    minorUnits?: boolean;
}
declare const NumberInput: React.ForwardRefExoticComponent<NumberInputProps & React.RefAttributes<HTMLInputElement>>;
type Entry = "end-ellipsis" | "start-ellipsis" | number;
declare function paginationRange(page: number, count: number, siblings?: number, boundaries?: number): Entry[];
interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
    count: number;
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    getHref?: (page: number) => string;
    siblings?: number;
    boundaries?: number;
    size?: "md" | "sm";
    "aria-label"?: string;
    previousLabel?: string;
    nextLabel?: string;
    pageLabel?: (page: number) => string;
}
declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLElement>>;
interface PasswordInputProps extends Omit<InputProps, "rightIcon" | "type"> {
    visible?: boolean;
    defaultVisible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    toggleLabel?: string;
}
declare const PasswordInput: React.ForwardRefExoticComponent<PasswordInputProps & React.RefAttributes<HTMLInputElement>>;
interface PopoverProps {
    trigger: React.ReactElement;
    children: ((close: () => void) => React.ReactNode) | React.ReactNode;
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
interface CopyButtonProps extends Omit<ButtonAsButtonProps, "icon" | "leftIcon" | "loading" | "loadingText" | "onCopy" | "rightIcon" | "value"> {
    value: (() => Promise<string> | string) | string;
    children?: React.ReactNode;
    copiedLabel?: string;
    iconOnly?: boolean;
    timeout?: number;
    onCopy?: (text: string) => void;
    onCopyError?: (error: unknown) => void;
}
declare const CopyButton: React.ForwardRefExoticComponent<CopyButtonProps & React.RefAttributes<HTMLButtonElement>>;
type MeterState = "none" | "optimum" | "poor" | "suboptimal";
interface MeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    value: number;
    min?: number;
    max?: number;
    low?: number;
    high?: number;
    optimum?: number;
    size?: "lg" | "md" | "sm";
    label?: React.ReactNode;
    showValue?: boolean;
    formatValue?: (value: number, min: number, max: number) => string;
}
declare function meterState(value: number, min: number, max: number, low?: number, high?: number, optimum?: number): MeterState;
declare const Meter: React.ForwardRefExoticComponent<MeterProps & React.RefAttributes<HTMLDivElement>>;
type ProgressTone = "danger" | "primary" | "success" | "warning";
interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    value?: null | number;
    max?: number;
    variant?: "bar" | "circle";
    size?: "lg" | "md" | "sm";
    tone?: ProgressTone;
    label?: React.ReactNode;
    showValue?: boolean;
    formatValue?: (value: number, max: number) => string;
}
declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
interface RadioGroupProps<V extends number | string = number | string> extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    name?: string;
    value?: null | V;
    defaultValue?: V;
    onChange?: (value: V, event: React.ChangeEvent<HTMLInputElement>) => void;
    orientation?: "horizontal" | "vertical";
    size?: "lg" | "md" | "sm";
    invalid?: boolean;
    disabled?: boolean;
    required?: boolean;
    children?: React.ReactNode;
}
interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    size?: "lg" | "md" | "sm";
    children?: React.ReactNode;
    description?: React.ReactNode;
    invalid?: boolean;
}
declare const RadioGroup: (<V extends number | string = number | string>(props: RadioGroupProps<V> & React.RefAttributes<HTMLDivElement>) => null | React.ReactElement) & {
    displayName?: string;
};
declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
interface SearchInputProps extends Omit<InputProps, "leftIcon" | "rightIcon" | "type"> {
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
interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    options: SegmentedControlOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    size?: "md" | "sm";
    fullWidth?: boolean;
    disabled?: boolean;
    name?: string;
    invalid?: boolean;
    required?: boolean;
    readOnly?: boolean;
}
declare const SegmentedControl: React.ForwardRefExoticComponent<SegmentedControlProps & React.RefAttributes<HTMLDivElement>>;
type SelectOption = {
    value: number | string;
    label?: React.ReactNode;
    disabled?: boolean;
} | number | string;
interface SelectOptionGroup {
    label: string;
    options: SelectOption[];
    disabled?: boolean;
}
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "multiple" | "size"> {
    size?: "lg" | "md" | "sm";
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
type SliderValue = [
    number,
    number
] | number;
interface SliderProps<V extends SliderValue = SliderValue> extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: V;
    defaultValue?: V;
    onValueChange?: (value: V) => void;
    onValueCommit?: (value: V) => void;
    min?: number;
    max?: number;
    step?: number;
    largeStep?: number;
    size?: "md" | "sm";
    disabled?: boolean;
    formatValue?: (value: number) => string;
    thumbLabels?: [
        string,
        string
    ];
    name?: string;
    invalid?: boolean;
    readOnly?: boolean;
    required?: boolean;
}
declare const Slider: (<V extends SliderValue = SliderValue>(props: SliderProps<V> & React.RefAttributes<HTMLDivElement>) => null | React.ReactElement) & {
    displayName?: string;
};
interface SortableListProps<T> extends Omit<React.HTMLAttributes<HTMLUListElement>, "children" | "onChange"> {
    items: readonly T[];
    getKey: (item: T) => number | string;
    getLabel: (item: T) => string;
    renderItem: (item: T, state: {
        index: number;
        dragging: boolean;
    }) => React.ReactNode;
    onReorder: (items: T[], move: {
        from: number;
        to: number;
    }) => void;
    disabled?: boolean;
    reorderLabel?: string;
}
declare const SortableList: <T>(props: SortableListProps<T> & {
    ref?: React.Ref<HTMLUListElement>;
}) => React.ReactElement;
interface StackProps extends React.HTMLAttributes<HTMLElement> {
    direction?: "column" | "row";
    gap?: Space;
    align?: "baseline" | "center" | "end" | "start" | "stretch";
    justify?: "between" | "center" | "end" | "start";
    wrap?: boolean;
    as?: "div" | "fieldset" | "footer" | "form" | "header" | "nav" | "ol" | "section" | "span" | "ul";
}
declare const Stack: React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLElement>>;
interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
    focusable?: boolean;
    as?: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label" | "legend" | "p" | "span";
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
    size?: "md" | "sm";
    onStepClick?: (index: number) => void;
    labels?: {
        completed?: string;
        error?: string;
        optional?: string;
        stepOf?: (step: number, total: number) => string;
    };
}
declare const Stepper: React.ForwardRefExoticComponent<StepperProps & React.RefAttributes<HTMLElement>>;
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "role" | "size" | "type"> {
    size?: "lg" | "md" | "sm";
    children?: React.ReactNode;
    description?: React.ReactNode;
    labelPosition?: "end" | "start";
    invalid?: boolean;
    readOnly?: boolean;
}
declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;
interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    size?: "md" | "sm";
    striped?: boolean;
    stickyHeader?: boolean;
    caption?: React.ReactNode;
    captionHidden?: boolean;
    containerProps?: React.HTMLAttributes<HTMLDivElement>;
}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    selected?: boolean;
}
interface TableSelectCellProps extends Omit<CheckboxProps, "children" | "description" | "size"> {
    label: string;
    header?: boolean;
    cellProps?: React.TdHTMLAttributes<HTMLTableCellElement>;
}
type SortDirection = "ascending" | "descending" | "none";
interface TableHeaderCellProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> {
    align?: "center" | "end" | "start";
    sort?: SortDirection;
    onSort?: () => void;
}
interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
    align?: "center" | "end" | "start";
}
declare const Table: React.ForwardRefExoticComponent<TableProps & React.RefAttributes<HTMLTableElement>>;
declare const TableHead: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
declare const TableBody: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
declare const TableFoot: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
declare const TableRow: React.ForwardRefExoticComponent<TableRowProps & React.RefAttributes<HTMLTableRowElement>>;
declare const TableSelectCell: React.ForwardRefExoticComponent<TableSelectCellProps & React.RefAttributes<HTMLInputElement>>;
declare const TableHeaderCell: React.ForwardRefExoticComponent<TableHeaderCellProps & React.RefAttributes<HTMLTableCellElement>>;
declare const TableCell: React.ForwardRefExoticComponent<TableCellProps & React.RefAttributes<HTMLTableCellElement>>;
type TabsVariant = "line" | "pill";
interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    variant?: TabsVariant;
    size?: "md" | "sm";
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
type TextSize = "base" | "lg" | "sm" | "xl" | "xs";
type TextTone = "danger" | "default" | "muted" | "primary";
type TextWeight = "bold" | "medium" | "normal" | "semibold";
interface TextProps extends React.HTMLAttributes<HTMLElement> {
    as?: "div" | "em" | "figcaption" | "label" | "li" | "p" | "small" | "span" | "strong";
    size?: TextSize;
    tone?: TextTone;
    weight?: TextWeight;
    truncate?: boolean;
    htmlFor?: string;
}
declare const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<HTMLElement>>;
interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> {
    size?: "lg" | "md" | "sm";
    rows?: number;
    autoResize?: boolean;
    maxRows?: number;
    resize?: "none" | "vertical";
    invalid?: boolean;
    showCount?: boolean;
}
declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "max" | "min" | "onChange" | "size" | "step" | "value"> {
    value?: null | string;
    defaultValue?: null | string;
    onValueChange?: (value: null | string) => void;
    min?: string;
    max?: string;
    step?: number;
    locale?: string;
    hour12?: boolean;
    size?: "lg" | "md" | "sm";
    invalid?: boolean;
    listLabel?: string;
}
declare const TimePicker: React.ForwardRefExoticComponent<TimePickerProps & React.RefAttributes<HTMLInputElement>>;
type ToastTone = "danger" | "info" | "neutral" | "success" | "warning";
type ToasterPosition = "bottom-center" | "bottom-end" | "bottom-start" | "top-center" | "top-end" | "top-start";
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
declare function show(options: string | ToastOptions): string;
declare function dismiss(id?: string): void;
declare const toast: typeof show & {
    dismiss: typeof dismiss;
};
interface ToasterProps extends React.HTMLAttributes<HTMLElement> {
    position?: ToasterPosition;
    label?: string;
    dismissLabel?: string;
    limit?: number;
}
declare const Toaster: ((props: ToasterProps) => React.ReactElement) & {
    displayName: string;
};
interface ToggleButtonProps extends Omit<ButtonAsButtonProps, "destructive" | "loading" | "loadingText" | "variant"> {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    variant?: "ghost" | "outline";
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
interface SerupaLabels {
    close: string;
    dismiss: string;
    loading: string;
    loadingResults: string;
    noResults: string;
    searching: string;
    clearSearch: string;
    copy: string;
    copied: string;
    copyFailed: string;
    remove: string;
    viewImage: string;
    removeImage: string;
    image: string;
    pagination: string;
    previousPage: string;
    nextPage: string;
    page: (page: number) => string;
    breadcrumb: string;
    showHiddenPages: string;
    previousMonth: string;
    nextMonth: string;
    previousSlide: string;
    nextSlide: string;
    slideOf: (slide: number, total: number) => string;
    decrease: string;
    increase: string;
    chooseDate: string;
    chooseDates: string;
    chooseTime: string;
    startDate: string;
    endDate: string;
    chooseStartDate: string;
    chooseEndDate: string;
    progress: string;
    completed: string;
    hasError: string;
    optional: string;
    stepOf: (step: number, total: number) => string;
    notifications: string;
    toastShortcut: (key: string) => string;
    moreToasts: (count: number) => string;
    mainNavigation: string;
    menu: string;
    reorder: string;
    reorderInstructions: string;
    reorderGrabbed: (item: string, position: number, total: number) => string;
    reorderMoved: (item: string, position: number, total: number) => string;
    reorderDropped: (item: string, position: number, total: number) => string;
    reorderCancelled: (item: string, position: number, total: number) => string;
    dragFiles: string;
    dragFile: string;
    chooseFiles: string;
    chooseFile: string;
    chosenFiles: string;
    chosenFile: string;
    required: string;
    showPassword: string;
    table: string;
}
declare const DEFAULT_LABELS: SerupaLabels;
declare const idLabels: SerupaLabels;
interface SerupaProviderProps {
    locale?: string;
    labels?: Partial<SerupaLabels>;
    icons?: Array<IconData | Readonly<Record<string, IconData>>> | IconData | Readonly<Record<string, IconData>>;
    children?: React.ReactNode;
}
interface SerupaSettings {
    locale: string | undefined;
    labels: SerupaLabels;
    icons: ReadonlyMap<string, IconData>;
}
declare function SerupaProvider(props: SerupaProviderProps): React.ReactElement;
declare namespace SerupaProvider {
    var displayName: string;
}
declare function useSerupa(): SerupaSettings;
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
            CopyButton: typeof CopyButton;
            customIcons: typeof customIcons;
            registerIcons: typeof registerIcons;
            getIcon: typeof getIcon;
            DatePicker: typeof DatePicker;
            DateRangePicker: typeof DateRangePicker;
            Dialog: typeof Dialog;
            Divider: typeof Divider;
            Drawer: typeof Drawer;
            EmptyState: typeof EmptyState;
            enLabels: typeof DEFAULT_LABELS;
            idLabels: typeof idLabels;
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
            Meter: typeof Meter;
            meterState: typeof meterState;
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
            SerupaProvider: typeof SerupaProvider;
            useSerupa: typeof useSerupa;
            Sidebar: typeof Sidebar;
            SidebarItem: typeof SidebarItem;
            SidebarSection: typeof SidebarSection;
            Slider: typeof Slider;
            SortableList: typeof SortableList;
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
            TableSelectCell: typeof TableSelectCell;
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
export { Accordion, AccordionItem, Alert, Avatar, AvatarGroup, Badge, Breadcrumb, BreadcrumbItem, Button, ButtonGroup, Calendar, Card, CardBody, CardFooter, CardHeader, Carousel, Checkbox, Combobox, Container, CopyButton, DatePicker, DateRangePicker, Dialog, Divider, Drawer, EmptyState, Fab, Field, FileUpload, Grid, Heading, Icon, IconButton, IconData, Image, Input, Kbd, Link, List, ListItem, Loader, MaterialIconName, Menu, MenuGroup, MenuItem, MenuSeparator, Meter, Navbar, NavbarLink, NumberInput, Pagination, PasswordInput, Popover, Progress, Radio, RadioGroup, SearchInput, SegmentedControl, Select, SerupaProvider, Sidebar, SidebarItem, SidebarSection, Slider, SortableList, Stack, Stepper, Switch, Tab, TabList, TabPanel, Table, TableBody, TableCell, TableFoot, TableHead, TableHeaderCell, TableRow, TableSelectCell, Tabs, Text, Textarea, TimePicker, Toaster, ToggleButton, Tooltip, VisuallyHidden, buttonClass, configure, customIcons, DEFAULT_LABELS as enLabels, formatFileSize, getIcon, idLabels, initials, meterState, paginationRange, registerIcons, toast, useSerupa, version };
export type { AccordionItemProps, AccordionProps, AlertProps, AlertTone, AvatarGroupProps, AvatarProps, AvatarSize, AvatarStatus, BadgeProps, BadgeTone, BadgeVariant, BreadcrumbItemProps, BreadcrumbProps, ButtonAsButtonProps, ButtonAsLinkProps, ButtonGroupProps, ButtonProps, ButtonSize, ButtonVariant, CalendarProps, CardBodyProps, CardFooterProps, CardHeaderProps, CardPadding, CardProps, CardVariant, CarouselProps, CheckboxProps, ComboboxOption, ComboboxProps, ContainerProps, ContainerSize, CopyButtonProps, CustomIconName, DatePickerProps, DateRange, DateRangePickerProps, DialogProps, DividerProps, DrawerProps, EmptyStateProps, FabPosition, FabProps, FieldProps, FileRejection, FileUploadProps, GridProps, HeadingLevel, HeadingProps, HeadingSize, IconButtonProps, IconName, IconProps, IconSource, ImageProps, ImageRatio, InputProps, KbdProps, LinkProps, ListItemProps, ListProps, LoaderPattern, LoaderProps, LoaderShape, LoaderTone, LoaderVariant, MenuGroupProps, MenuItemProps, MenuProps, MeterProps, MeterState, NavbarLinkProps, NavbarProps, NumberInputProps, PaginationProps, PasswordInputProps, Placement, PopoverProps, ProgressProps, ProgressTone, RadioGroupProps, RadioProps, SearchInputProps, SegmentedControlOption, SegmentedControlProps, SelectOption, SelectOptionGroup, SelectProps, SerupaConfig, SerupaLabels, SerupaProviderProps, SerupaSettings, SerupaTheme, SidebarItemProps, SidebarProps, SidebarSectionProps, SliderProps, SliderValue, SortDirection, SortableListProps, Space, StackProps, StepperProps, StepperStep, SwitchProps, TabPanelProps, TabProps, TableCellProps, TableHeaderCellProps, TableProps, TableRowProps, TableSelectCellProps, TabsProps, TabsVariant, TextProps, TextSize, TextTone, TextWeight, TextareaProps, ThemeBrand, ThemeInfo, ThemeMode, TimePickerProps, ToastOptions, ToastTone, ToasterPosition, ToasterProps, ToggleButtonProps, TooltipProps, VisuallyHiddenProps };
