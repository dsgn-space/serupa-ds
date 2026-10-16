/*! Diki Design System · React components (needs React 18+) · CHANGELOG.md */
import { Badge } from "./components/Badge/Badge";
export type { BadgeProps, BadgeTone, BadgeVariant } from "./components/Badge/Badge";
import { Button, buttonClass } from "./components/Button/Button";
export type { ButtonAsButtonProps, ButtonAsLinkProps, ButtonProps, ButtonSize, ButtonVariant } from "./components/Button/Button";
import { Checkbox } from "./components/Checkbox/Checkbox";
export type { CheckboxProps } from "./components/Checkbox/Checkbox";
import { Field } from "./components/Field/Field";
export type { FieldProps } from "./components/Field/Field";
import { Icon } from "./components/Icon/Icon";
export type { IconName, IconProps } from "./components/Icon/Icon";
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
import { Textarea } from "./components/Textarea/Textarea";
export type { TextareaProps } from "./components/Textarea/Textarea";
import { configure } from "./internal/config";
export type { DikiConfig } from "./internal/config";
import { customIcons } from "./icons";
export type { CustomIconName } from "./icons";
export type { DikiTheme, ThemeBrand, ThemeInfo, ThemeMode } from "./theme-types";

export { Badge, Button, buttonClass, Checkbox, configure, customIcons, Field, Icon, Input, Loader, Radio, RadioGroup, Select, Switch, Textarea };

/** The system's version, e.g. "4.8.0" (semver). */
export const version: string = __VERSION__;

type ThemeApi = import("./theme-types").DikiTheme;
declare global {
  interface Window {
    /** The components on plain pages (diki.iife.js, also shipped as bundle.js). */
    Diki: {
      /** The system's version, e.g. "4.8.0" (semver). */ version: string;
      Badge: typeof Badge; Button: typeof Button; buttonClass: typeof buttonClass; Checkbox: typeof Checkbox; configure: typeof configure;
      Field: typeof Field; Icon: typeof Icon; Input: typeof Input; Loader: typeof Loader; Radio: typeof Radio; RadioGroup: typeof RadioGroup;
      Select: typeof Select; Switch: typeof Switch; Textarea: typeof Textarea; customIcons: typeof customIcons;
      /** Present when theme.js is loaded. */ theme?: ThemeApi;
    };
  }
}
