'use client';
import * as React from 'react';
import { cn } from '../../internal/cn';
import { component } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import type { OpenChangeDetails } from '../../internal/openChange';
import * as icons from '../../material/builtin';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import { Popover, type PopoverProps } from '../Popover/Popover';
import { en as words } from './labels';

export interface ContextualHelpProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title' | 'role'> {
  /** What the help says: a sentence or two, and a link to more if there is more. */
  children: React.ReactNode;
  /** A short heading at the top of the panel ("What's a workspace?"). */
  title?: React.ReactNode | undefined;
  /** The title's heading level, to fit the page's outline. Default: 3. */
  headingLevel?: PopoverProps['headingLevel'];
  /** `help` (default): a question mark, for how something works. `info`: an "i", for extra facts about a value. */
  variant?: 'help' | 'info' | undefined;
  /** The button's name for screen readers. Default: labels.contextualHelp ("Help") or labels.contextualInfo
      ("Information"); name the topic when several share a page ("Help: billing address"). */
  label?: string | undefined;
  /** Where the panel goes beside the button. Default: 'bottom-start'. It flips when there's no room. */
  placement?: PopoverProps['placement'];
  /** Open it yourself (controlled), with onOpenChange. */
  open?: boolean | undefined;
  /** Open at first (uncontrolled). Default: false. */
  defaultOpen?: boolean | undefined;
  /** Called when it asks to open or close, with why. */
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
}

/* ContextualHelp (a toggletip): a 24px round ghost IconButton with an "?" or "i", named "Help" or "Information" (or
   label), that opens a small non-modal Popover beside it with aria-expanded and aria-controls on the button. Pressing
   it again, Escape, a click outside or moving focus away closes it; Escape returns focus to the button. The panel
   takes the ref, className, style and other attributes. */
/** A small "?" or "i" button beside a label or value that opens a short explanation in a non-modal popover.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const ContextualHelp = /* @__PURE__ */ component<HTMLDivElement, ContextualHelpProps>('ContextualHelp', function ContextualHelp(props, ref) {
  const sds = useSettings(words);
  const { children, title, headingLevel = 3, variant = 'help', label, placement = 'bottom-start', className, ...rest } = props;
  const info = variant === 'info';
  const name = label || (info ? sds.labels.contextualInfo : sds.labels.contextualHelp);
  const trigger = (
    <IconButton className={cn('dk-contextual-help__button', info && 'dk-contextual-help__button--info')} shape="round" size="sm"
      icon={<Icon icon={info ? icons.Info : icons.Help} />} label={name} />
  );
  return (
    <Popover {...rest} ref={ref} trigger={trigger} title={title} headingLevel={headingLevel} placement={placement}
      aria-label={title == null ? name : undefined} className={cn('dk-contextual-help', className)}>
      {children}
    </Popover>
  );
});
