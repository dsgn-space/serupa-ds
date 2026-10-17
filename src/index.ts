/*! Diki Design System · React components (needs React 18+) · CHANGELOG.md */
import { Accordion, AccordionItem } from "./components/Accordion/Accordion";
export type { AccordionItemProps, AccordionProps } from "./components/Accordion/Accordion";
import { Alert } from "./components/Alert/Alert";
export type { AlertProps, AlertTone } from "./components/Alert/Alert";
import { Avatar, initials } from "./components/Avatar/Avatar";
export type { AvatarProps, AvatarSize, AvatarStatus } from "./components/Avatar/Avatar";
import { Badge } from "./components/Badge/Badge";
export type { BadgeProps, BadgeTone, BadgeVariant } from "./components/Badge/Badge";
import { Breadcrumb, BreadcrumbItem } from "./components/Breadcrumb/Breadcrumb";
export type { BreadcrumbItemProps, BreadcrumbProps } from "./components/Breadcrumb/Breadcrumb";
import { Button, buttonClass } from "./components/Button/Button";
export type { ButtonAsButtonProps, ButtonAsLinkProps, ButtonProps, ButtonSize, ButtonVariant } from "./components/Button/Button";
import { ButtonGroup } from "./components/ButtonGroup/ButtonGroup";
export type { ButtonGroupProps } from "./components/ButtonGroup/ButtonGroup";
import { Card, CardBody, CardFooter, CardHeader } from "./components/Card/Card";
export type { CardBodyProps, CardFooterProps, CardHeaderProps, CardPadding, CardProps, CardVariant } from "./components/Card/Card";
import { Checkbox } from "./components/Checkbox/Checkbox";
export type { CheckboxProps } from "./components/Checkbox/Checkbox";
import { Container } from "./components/Container/Container";
export type { ContainerProps, ContainerSize } from "./components/Container/Container";
import { Dialog } from "./components/Dialog/Dialog";
export type { DialogProps } from "./components/Dialog/Dialog";
import { Divider } from "./components/Divider/Divider";
export type { DividerProps } from "./components/Divider/Divider";
import { Drawer } from "./components/Drawer/Drawer";
export type { DrawerProps } from "./components/Drawer/Drawer";
import { EmptyState } from "./components/EmptyState/EmptyState";
export type { EmptyStateProps } from "./components/EmptyState/EmptyState";
import { Fab } from "./components/Fab/Fab";
export type { FabPosition, FabProps } from "./components/Fab/Fab";
import { Field } from "./components/Field/Field";
export type { FieldProps } from "./components/Field/Field";
import { Grid } from "./components/Grid/Grid";
export type { GridProps } from "./components/Grid/Grid";
import { Heading } from "./components/Heading/Heading";
export type { HeadingLevel, HeadingProps, HeadingSize } from "./components/Heading/Heading";
import { Icon } from "./components/Icon/Icon";
export type { IconName, IconProps } from "./components/Icon/Icon";
import { IconButton } from "./components/IconButton/IconButton";
export type { IconButtonProps } from "./components/IconButton/IconButton";
import { Input } from "./components/Input/Input";
export type { InputProps } from "./components/Input/Input";
import { List, ListItem } from "./components/List/List";
export type { ListItemProps, ListProps } from "./components/List/List";
import { Loader } from "./components/Loader/Loader";
export type { LoaderPattern, LoaderProps, LoaderShape, LoaderTone, LoaderVariant } from "./components/Loader/Loader";
import { Link } from "./components/Link/Link";
export type { LinkProps } from "./components/Link/Link";
import { Menu, MenuGroup, MenuItem, MenuSeparator } from "./components/Menu/Menu";
export type { MenuGroupProps, MenuItemProps, MenuProps } from "./components/Menu/Menu";
import { Navbar, NavbarLink } from "./components/Navbar/Navbar";
export type { NavbarLinkProps, NavbarProps } from "./components/Navbar/Navbar";
import { Pagination, paginationRange } from "./components/Pagination/Pagination";
export type { PaginationProps } from "./components/Pagination/Pagination";
import { PasswordInput } from "./components/PasswordInput/PasswordInput";
export type { PasswordInputProps } from "./components/PasswordInput/PasswordInput";
import { Popover } from "./components/Popover/Popover";
export type { PopoverProps } from "./components/Popover/Popover";
import { Progress } from "./components/Progress/Progress";
export type { ProgressProps, ProgressTone } from "./components/Progress/Progress";
import { Radio, RadioGroup } from "./components/Radio/Radio";
export type { RadioGroupProps, RadioProps } from "./components/Radio/Radio";
import { Select } from "./components/Select/Select";
export type { SelectOption, SelectOptionGroup, SelectProps } from "./components/Select/Select";
import { Sidebar, SidebarItem, SidebarSection } from "./components/Sidebar/Sidebar";
export type { SidebarItemProps, SidebarProps, SidebarSectionProps } from "./components/Sidebar/Sidebar";
import { Stack } from "./components/Stack/Stack";
export type { StackProps } from "./components/Stack/Stack";
export type { Space } from "./internal/space";
import { VisuallyHidden } from "./components/VisuallyHidden/VisuallyHidden";
export type { VisuallyHiddenProps } from "./components/VisuallyHidden/VisuallyHidden";
import { Switch } from "./components/Switch/Switch";
export type { SwitchProps } from "./components/Switch/Switch";
import { Table, TableBody, TableCell, TableFoot, TableHead, TableHeaderCell, TableRow } from "./components/Table/Table";
export type { SortDirection, TableCellProps, TableHeaderCellProps, TableProps, TableRowProps } from "./components/Table/Table";
import { Tab, TabList, TabPanel, Tabs } from "./components/Tabs/Tabs";
export type { TabPanelProps, TabProps, TabsProps, TabsVariant } from "./components/Tabs/Tabs";
import { Text } from "./components/Text/Text";
export type { TextProps, TextSize, TextTone, TextWeight } from "./components/Text/Text";
import { Textarea } from "./components/Textarea/Textarea";
export type { TextareaProps } from "./components/Textarea/Textarea";
import { toast, Toaster } from "./components/Toast/Toast";
export type { ToasterPosition, ToasterProps, ToastOptions, ToastTone } from "./components/Toast/Toast";
import { ToggleButton } from "./components/ToggleButton/ToggleButton";
export type { ToggleButtonProps } from "./components/ToggleButton/ToggleButton";
import { Tooltip } from "./components/Tooltip/Tooltip";
export type { TooltipProps } from "./components/Tooltip/Tooltip";
export type { Placement } from "./internal/position";
import { configure } from "./internal/config";
export type { DikiConfig } from "./internal/config";
import { customIcons } from "./icons";
export type { CustomIconName } from "./icons";
export type { DikiTheme, ThemeBrand, ThemeInfo, ThemeMode } from "./theme-types";

export { Accordion, AccordionItem, Alert, Avatar, Badge, Breadcrumb, BreadcrumbItem, Button, buttonClass, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Checkbox, configure, Container, customIcons, Dialog, Divider, Drawer, EmptyState, Fab, Field, Grid, Heading, Icon, IconButton, initials, Input, Link, List, ListItem, Loader, Menu, MenuGroup, MenuItem, MenuSeparator, Navbar, NavbarLink, Pagination, paginationRange, PasswordInput, Popover, Progress, Radio, RadioGroup, Select, Sidebar, SidebarItem, SidebarSection, Stack, Switch, Tab, Table, TableBody, TableCell, TableFoot, TableHead, TableHeaderCell, TableRow, TabList, TabPanel, Tabs, Text, Textarea, toast, Toaster, ToggleButton, Tooltip, VisuallyHidden };

/** The system's version, e.g. "4.8.0" (semver). */
export const version: string = __VERSION__;

type ThemeApi = import("./theme-types").DikiTheme;
declare global {
  interface Window {
    /** The components on plain pages (diki.iife.js, also shipped as bundle.js). */
    Diki: {
      /** The system's version, e.g. "4.8.0" (semver). */ version: string;
      Alert: typeof Alert; Avatar: typeof Avatar; initials: typeof initials; Badge: typeof Badge; Button: typeof Button; buttonClass: typeof buttonClass;
      Card: typeof Card; CardBody: typeof CardBody; CardFooter: typeof CardFooter; CardHeader: typeof CardHeader; Checkbox: typeof Checkbox; configure: typeof configure;
      Container: typeof Container; Dialog: typeof Dialog; Divider: typeof Divider; Grid: typeof Grid; Stack: typeof Stack; Fab: typeof Fab; Field: typeof Field; Heading: typeof Heading; Icon: typeof Icon; IconButton: typeof IconButton; Input: typeof Input; Loader: typeof Loader;
      Breadcrumb: typeof Breadcrumb; BreadcrumbItem: typeof BreadcrumbItem; Link: typeof Link; VisuallyHidden: typeof VisuallyHidden;
      Menu: typeof Menu; MenuGroup: typeof MenuGroup; MenuItem: typeof MenuItem; MenuSeparator: typeof MenuSeparator; Progress: typeof Progress; Radio: typeof Radio; RadioGroup: typeof RadioGroup;
      Select: typeof Select; Switch: typeof Switch;
      Table: typeof Table; TableBody: typeof TableBody; TableCell: typeof TableCell; TableFoot: typeof TableFoot; TableHead: typeof TableHead; TableHeaderCell: typeof TableHeaderCell; TableRow: typeof TableRow;
      Tab: typeof Tab; TabList: typeof TabList; TabPanel: typeof TabPanel; Tabs: typeof Tabs; Text: typeof Text; Textarea: typeof Textarea; toast: typeof toast; Toaster: typeof Toaster; Tooltip: typeof Tooltip; customIcons: typeof customIcons;
      /** Present when theme.js is loaded. */ theme?: ThemeApi;
    };
  }
}
