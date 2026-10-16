/*! Diki Design System · React components (needs React 18+) · CHANGELOG.md */
import { Alert } from "./components/Alert/Alert";
export type { AlertProps, AlertTone } from "./components/Alert/Alert";
import { Avatar, initials } from "./components/Avatar/Avatar";
export type { AvatarProps, AvatarSize, AvatarStatus } from "./components/Avatar/Avatar";
import { Badge } from "./components/Badge/Badge";
export type { BadgeProps, BadgeTone, BadgeVariant } from "./components/Badge/Badge";
import { Button, buttonClass } from "./components/Button/Button";
export type { ButtonAsButtonProps, ButtonAsLinkProps, ButtonProps, ButtonSize, ButtonVariant } from "./components/Button/Button";
import { Card, CardBody, CardFooter, CardHeader } from "./components/Card/Card";
export type { CardBodyProps, CardFooterProps, CardHeaderProps, CardPadding, CardProps, CardVariant } from "./components/Card/Card";
import { Checkbox } from "./components/Checkbox/Checkbox";
export type { CheckboxProps } from "./components/Checkbox/Checkbox";
import { Fab } from "./components/Fab/Fab";
export type { FabPosition, FabProps } from "./components/Fab/Fab";
import { Field } from "./components/Field/Field";
export type { FieldProps } from "./components/Field/Field";
import { Heading } from "./components/Heading/Heading";
export type { HeadingLevel, HeadingProps, HeadingSize } from "./components/Heading/Heading";
import { Icon } from "./components/Icon/Icon";
export type { IconName, IconProps } from "./components/Icon/Icon";
import { IconButton } from "./components/IconButton/IconButton";
export type { IconButtonProps } from "./components/IconButton/IconButton";
import { Input } from "./components/Input/Input";
export type { InputProps } from "./components/Input/Input";
import { Loader } from "./components/Loader/Loader";
export type { LoaderPattern, LoaderProps, LoaderShape, LoaderTone, LoaderVariant } from "./components/Loader/Loader";
import { Radio, RadioGroup } from "./components/Radio/Radio";
export type { RadioGroupProps, RadioProps } from "./components/Radio/Radio";
import { Select } from "./components/Select/Select";
export type { SelectOption, SelectOptionGroup, SelectProps } from "./components/Select/Select";
import { Switch } from "./components/Switch/Switch";
export type { SwitchProps } from "./components/Switch/Switch";
import { Tab, TabList, TabPanel, Tabs } from "./components/Tabs/Tabs";
export type { TabPanelProps, TabProps, TabsProps, TabsVariant } from "./components/Tabs/Tabs";
import { Text } from "./components/Text/Text";
export type { TextProps, TextSize, TextTone, TextWeight } from "./components/Text/Text";
import { Textarea } from "./components/Textarea/Textarea";
export type { TextareaProps } from "./components/Textarea/Textarea";
import { configure } from "./internal/config";
export type { DikiConfig } from "./internal/config";
import { customIcons } from "./icons";
export type { CustomIconName } from "./icons";
export type { DikiTheme, ThemeBrand, ThemeInfo, ThemeMode } from "./theme-types";

export { Alert, Avatar, Badge, Button, buttonClass, Card, CardBody, CardFooter, CardHeader, Checkbox, configure, customIcons, Fab, Field, Heading, Icon, IconButton, initials, Input, Loader, Radio, RadioGroup, Select, Switch, Tab, TabList, TabPanel, Tabs, Text, Textarea };

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
      Fab: typeof Fab; Field: typeof Field; Heading: typeof Heading; Icon: typeof Icon; IconButton: typeof IconButton; Input: typeof Input; Loader: typeof Loader; Radio: typeof Radio; RadioGroup: typeof RadioGroup;
      Select: typeof Select; Switch: typeof Switch;
      Tab: typeof Tab; TabList: typeof TabList; TabPanel: typeof TabPanel; Tabs: typeof Tabs; Text: typeof Text; Textarea: typeof Textarea; customIcons: typeof customIcons;
      /** Present when theme.js is loaded. */ theme?: ThemeApi;
    };
  }
}
