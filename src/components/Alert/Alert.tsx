import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn";
import { Icon, asIcon, type IconSource } from "../Icon/Icon";
import { Button } from "../Button/Button";

export type AlertTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 'info' (default), 'success', 'warning', 'danger' or 'neutral'. Sets the background, the border tint and the icon. */
  tone?: AlertTone;
  /** A short bold first line. */
  title?: React.ReactNode;
  /** The icon before the content: an icon name or element, or false for none. Default: each tone's own (info, check_circle, warning, error). */
  icon?: IconSource | false;
  /** Buttons or links under the message. */
  actions?: React.ReactNode;
  /** Shows a close button that calls this. Hide or remove the alert yourself. */
  onDismiss?: () => void;
  /** The close button's name. Default: 'Dismiss'. */
  dismissLabel?: string;
}

/* Alert: a message about the page or a task, in a tinted box with an icon. tone info (default), success, warning,
   danger or neutral. role is "alert" for warning and danger (read at once when it appears) and "status" for the
   others; pass role to change it. className and every other prop go to the box. */
const OWN = { tone: 1, title: 1, icon: 1, actions: 1, onDismiss: 1, dismissLabel: 1, className: 1, children: 1 } as const;
const TONES: readonly AlertTone[] = ["info", "success", "warning", "danger", "neutral"];
const ICONS: Record<AlertTone, string> = { info: "info", success: "check_circle", warning: "warning", danger: "error", neutral: "info" };

/** A message about the page or a task: a tinted box with an icon, an optional title, actions and a close button. */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  const rest = omit(props, OWN);
  const tone = oneOf(TONES, props.tone, "info");
  const has = (n: React.ReactNode) => n != null && n !== false && n !== "";
  if (rest.role == null) rest.role = tone === "warning" || tone === "danger" ? "alert" : "status";
  const icon = props.icon === false ? null : props.icon == null || props.icon === true ? <Icon name={ICONS[tone]} /> : asIcon(props.icon);
  return (
    <div {...rest} ref={ref} className={cn("dk-alert", "dk-alert--" + tone, props.className)} data-component="alert" data-tone={tone}>
      {icon ? <span className="dk-alert__icon" aria-hidden="true">{icon}</span> : null}
      <div className="dk-alert__content">
        {has(props.title) ? <p className="dk-alert__title">{props.title}</p> : null}
        {has(props.children) ? <div className="dk-alert__message">{props.children}</div> : null}
        {has(props.actions) ? <div className="dk-alert__actions">{props.actions}</div> : null}
      </div>
      {props.onDismiss ? <Button className="dk-alert__dismiss" variant="ghost" size="sm" icon="close" aria-label={props.dismissLabel || "Dismiss"} onClick={props.onDismiss} /> : null}
    </div>
  );
});
Alert.displayName = "Alert";
