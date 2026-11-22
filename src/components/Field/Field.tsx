'use client';
import * as React from 'react';
import { cn, domId, omit, useMergedRef } from '../../internal/cn';
import { Icon } from '../Icon/Icon';
import { named } from '../../internal/component';
import { FieldContext, type FieldControl } from '../../internal/field';
import * as icons from '../../material/builtin';
import { FieldLabel } from '../../internal/fieldLabel';
import { useLocale, useSettings } from '../../internal/provider';
import { problemText } from '../../internal/validity';
import { en as inputWords } from '../Input/labels';
import { announce, ensureAnnouncer } from '../../internal/announce';
import { summarySaysIt } from '../../internal/summaryFocus';
import { warnOnce } from '../../internal/warn';
import { LoaderRing } from '../../internal/loaderRing';
import { en as words } from './labels';
import { byId } from '../../internal/root';
import { FormErrorsContext, useFormErrors } from '../../internal/formErrors';

// module state: a fixed list, never changed.
const LABELABLE = new Set(['select', 'button', 'meter', 'output', 'progress', 'textarea']);

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** The label: a <label> linked to the control, or with group, the fieldset's <legend>. */
  label?: React.ReactNode | undefined;
  /** Help text under the label, before the control (text-muted); added to the control's aria-describedby. */
  hint?: React.ReactNode | undefined;
  /** An error message under the control (danger-text, with an icon); makes the control invalid and is added to its aria-describedby. */
  error?: React.ReactNode | undefined;
  /** Advice that doesn't block: a message under the control (warning-text, with an icon), such as "A project with
   *  this name was archived last year". The control stays valid and the form can be sent. Added to its
   *  aria-describedby and said politely when it appears. An error takes its place while there is one. */
  warning?: React.ReactNode | undefined;
  /** While the answer is being checked, often on the server: the words that say so ("Checking the address…"), with a
   *  small spinner, under the control. Added to its aria-describedby and said politely; the field has aria-busy. It
   *  takes the place of a warning, and an error takes its place. */
  checking?: React.ReactNode | undefined;
  /** A * after the label (hidden from screen readers) and aria-required on the control; with group, "Required" in words in the legend for screen readers. Add the control's own required for the browser's check. */
  required?: boolean | undefined;
  /** "(optional)" after the label, or your own words. Ignored with required. */
  optional?: boolean | string | undefined;
  /** Disables the control (with group, every control in the fieldset) and draws the label and hint in disabled-text. */
  disabled?: boolean | undefined;
  /** A <fieldset> with a <legend> for a set of checkboxes or radios; the hint and error describe the fieldset. */
  group?: boolean | undefined;
  /** 'vertical' (default): label, control, hint and error stacked. 'horizontal': the label in a column at the start
   *  (--field-label-width) on the control's first line, with the control, hint and error beside it, for dense
   *  settings forms; it stacks again when the field is too narrow for both. Not with group. */
  orientation?: 'vertical' | 'horizontal' | undefined;
  /** The control's name in the form, which picks its message from a surrounding FormErrors. Default: the name of the
   *  control passed as the Field's child. */
  name?: string | undefined;
  /** The control's id; by default the control's own id, or a generated one. */
  id?: string | undefined;
  /** One control (Input, Textarea, Select or any element), or with group, the set. */
  children?: React.ReactNode | undefined;
}

/* Field: a label, an optional hint and an error message around one form control. It gives the control an id
   (unless it has one), at any depth (through FieldContext), links the label to it, adds the hint and error to its aria-describedby, and passes
   invalid (with error), aria-required (with required) and disabled. group renders a <fieldset> with a <legend>
   instead, for a set of checkboxes or radios, and puts the hint and error on the fieldset. */
/** The props Field reads from and hands to its control (a component like Input, or a DOM element). */
type ControlProps = { id?: string; name?: string; invalid?: boolean; disabled?: boolean; 'aria-describedby'?: string; 'aria-errormessage'?: string; 'aria-required'?: boolean | 'true' | 'false'; 'aria-invalid'?: boolean };

const OWN = { label: 1, hint: 1, error: 1, warning: 1, checking: 1, name: 1, required: 1, optional: 1, disabled: 1, group: 1, orientation: 1, id: 1, children: 1, className: 1 } as const;

function FieldRender({ ref, ...props }: FieldProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, OWN);
  const base = domId('srp-f', React.useId());
  const child = React.Children.count(props.children) === 1 && React.isValidElement(props.children) ? (props.children as React.ReactElement<ControlProps>) : null;
  const controlId = props.id || (child && child.props.id) || base + '-control';
  // Inside FormErrors: the message for this field's name, unless error is given, and gone once the field is edited.
  const form = React.useContext(FormErrorsContext);
  const name = props.name ?? (child ? child.props.name : undefined);
  const given = props.error != null && props.error !== false && props.error !== '';
  const fromForm = !given && form && name ? form.message(name) : null;
  const native = useNativeError(!given && fromForm == null);
  const errorText = given ? props.error : fromForm != null ? fromForm : native.text || null;
  const hasError = errorText != null && errorText !== false && errorText !== '';
  const place = form ? form.place : null;
  React.useEffect(() => (place && name ? place(name, controlId) : undefined), [place, name, controlId]);
  // Typing in the field, or any change to it, takes its form message away: it described the value that was sent.
  const edited = form && name && fromForm != null ? () => form.clear(name) : undefined;
  // One message under the control, the most urgent: an error, then "checking…", then a warning.
  const shows = (v: React.ReactNode) => v != null && v !== false && v !== '';
  // Inside a Form, "Checking…" while one of its checks runs for this field.
  const checking = shows(props.checking) ? props.checking : form && form.checking && name ? form.checking(name) : null;
  const kind = hasError ? 'error' : shows(checking) ? 'checking' : shows(props.warning) ? 'warning' : null;
  const hintId = props.hint ? base + '-hint' : null, errorId = hasError ? base + '-error' : null;
  const noteId = kind === 'checking' || kind === 'warning' ? base + '-' + kind : null;
  const group = !!props.group;
  const sds = useSettings(words);
  // An error that appears (or changes) after mount is said politely: it's only a description, which
  // screen readers read on focus, and focus is usually elsewhere (the submit button) when it shows.
  const errorRef = React.useRef<HTMLSpanElement>(null);
  const labelRef = React.useRef<HTMLLabelElement>(null);
  const said = React.useRef<string | null>(null);
  React.useEffect(function () { ensureAnnouncer(); }, []);   // no cleanup: the region is shared
  // every render: the error is the caller's children, so its text can change in any render; reading it is cheap.
  React.useEffect(function () {
    const text = errorRef.current ? errorRef.current.textContent || '' : '';
    // An ErrorSummary that took focus in this commit reads every error itself (GR54).
    if (said.current !== null && text && text !== said.current && !summarySaysIt(errorRef.current)) announce(text);
    said.current = text;
  });
  // The label points at the control by id: say so when nothing on the page has it.
  // every render: the control is the caller's children and can come or go in any render; it warns once.
  React.useEffect(function () {
    // Looked up in the label's own document or shadow root (GR60).
    if (process.env.NODE_ENV !== 'production' && !group && props.label != null && labelRef.current && !byId(labelRef.current, controlId)) {
      warnOnce('field-control', 'Field: no element has the id "' + controlId + '", so the label names nothing. Put the control inside the Field, or pass its id.');
    }
  });
  /* A label only focuses a labelable element (an input, select, button). Slider, SegmentedControl and ColorPicker
     have a <div> root, which hands focus to its thumb or checked option: clicking the label focuses that, as
     clicking an input's label does. */
  const focusControl = function (e: React.MouseEvent<HTMLLabelElement>) {
    if (e.currentTarget.control) return;
    const el = byId(e.currentTarget, controlId);
    if (el) el.focus();
  };
  // A fieldset can't carry aria-required, and the * is hidden: with group, the legend says it in words (FR1), so the
  // group is read as "Contact by, Required" whatever it holds.
  const labelKids = <>
    {props.label}
    {props.required ? <span className="srp-field__required" aria-hidden>*</span> : null}
    {props.required && group ? <span className="srp-visually-hidden">{' ' + sds.labels.required}</span> : null}
    {!props.required && props.optional ? <span className="srp-field__optional">{typeof props.optional === 'string' ? props.optional : sds.labels.fieldOptional}</span> : null}
  </>;
  const label = props.label == null ? null : group
    ? React.createElement('legend', { className: 'srp-field__label', key: 'label' }, labelKids)
    : <label className="srp-field__label" htmlFor={controlId} id={base + '-label'} key="label" onClick={focusControl} ref={labelRef}>{labelKids}</label>;
  const hint = props.hint ? <div className="srp-field__hint" id={hintId as string} key="hint">{props.hint}</div> : null;
  const error = hasError ? <div className="srp-field__error" key="error"><Icon icon={icons.Error} className="srp-field__error-icon" /><span id={errorId as string} ref={errorRef}>{errorText}</span></div>
    // The same slot, and the same polite announcement, for advice and for "checking…": neither makes the control invalid.
    : kind === 'warning' ? <div className="srp-field__warning" key="warning"><Icon icon={icons.Warning} className="srp-field__error-icon" /><span id={noteId as string} ref={errorRef}>{props.warning}</span></div>
    : kind === 'checking' ? <div className="srp-field__checking" key="checking"><LoaderRing size="sm" className="srp-field__error-icon" /><span id={noteId as string} ref={errorRef}>{checking}</span></div>
    : null;
  const described = cn(hintId, errorId, noteId);
  const pass = function (el: React.ReactNode, isControl: boolean) {   // the props Field hands a control: components get invalid, DOM elements aria-invalid
    if (!React.isValidElement(el)) return el;
    const p = el.props as ControlProps & { children?: React.ReactNode };
    const add: ControlProps = {}, dom = typeof el.type === 'string';
    // A plain element holding other elements is a wrapper, not the control: the control inside reads FieldContext.
    // A labelable element is the control even with element children (a <select>'s options, a <button>'s icon).
    if (isControl && dom && !LABELABLE.has(el.type as string) && React.Children.toArray(p.children).some(React.isValidElement)) return el;
    if (isControl) {
      if (!p.id) add.id = controlId;
      if (described) add['aria-describedby'] = cn(p['aria-describedby'], described);
      // The error stays in the description too: aria-errormessage alone isn't read by every screen reader yet.
      if (errorId && p['aria-errormessage'] == null) add['aria-errormessage'] = errorId;
      if (props.required && p['aria-required'] == null) add['aria-required'] = true;
    }
    if (hasError) { if (dom) add['aria-invalid'] = true; else add.invalid = true; }
    // Inside a Form with defaultValues: the value it starts with, unless the control has its own.
    const start = form && form.defaultValue && p.name ? form.defaultValue(p.name) : undefined;
    if (start !== undefined && !('value' in p) && !('defaultValue' in p) && !('checked' in p) && !('defaultChecked' in p)) {
      if (typeof start === 'boolean') (add as { defaultChecked?: boolean }).defaultChecked = start;
      else (add as { defaultValue?: unknown }).defaultValue = start;
    }
    if (props.disabled && !group) add.disabled = true;
    return React.cloneElement(el, add);
  };
  const rootRef = useRoot(ref, native.root);
  const horizontal = !group && props.orientation === 'horizontal';
  const cls = cn('srp-field', group && 'srp-field--group', horizontal && 'srp-field--horizontal', hasError && 'srp-field--invalid', kind === 'warning' && 'srp-field--warning', kind === 'checking' && 'srp-field--checking', props.disabled && 'srp-field--disabled', props.className);
  const busy = kind === 'checking' || undefined;
  if (group) {
    return (
      <fieldset {...rest} {...listen(rest, edited)} ref={rootRef} className={cls} disabled={props.disabled || undefined} aria-describedby={described || undefined} aria-busy={busy} data-component="field">
        {label}
        <FieldContext.Provider value={null}>
          <div className="srp-field__control" key="control">{React.Children.map(props.children, function (c) { return pass(c, false); })}</div>
        </FieldContext.Provider>
        {hint}
        {error}
      </fieldset>
    );
  }
  // The control can be any depth down (in a Tooltip, a wrapper component): it reads this.
  const control: FieldControl = { id: controlId, labelId: props.label == null ? undefined : base + '-label', describedBy: described || undefined, errorMessage: errorId || undefined, required: props.required || undefined, invalid: hasError || undefined, disabled: props.disabled || undefined };
  const body = <FieldContext.Provider value={control} key="body">
    <div className="srp-field__control" key="control">
      <FieldLabel value={label ? { control: controlId, label: base + '-label' } : null}>{child ? pass(child, true) : props.children}</FieldLabel>
    </div>
  </FieldContext.Provider>;
  // Horizontal: the label beside a column holding the control, then the hint and the error under it.
  if (horizontal) return <div {...rest} {...listen(rest, edited)} ref={rootRef} className={cls} aria-busy={busy} data-component="field" data-layout="horizontal">{label}<div className="srp-field__body">{body}{hint}{error}</div></div>;
  return (
    <div {...rest} {...listen(rest, edited)} ref={rootRef} className={cls} aria-busy={busy} data-component="field">
      {label}
      {body}
      {hint}
      {error}
    </div>
  );
}

/** A label, an optional hint and an error message around one form control, wired up for screen readers. className, ref and other attributes go to the outer element (a <fieldset> with group). */
export const Field = /* @__PURE__ */ named('Field', FieldRender);

/* The browser's own verdict on the control, shown as the Field's error once people have touched it: when the
   control matches :user-invalid (changed and left, or a submit was tried), the error slot says which constraint it
   fails, in the provider's words (invalidValue; "" keeps the browser's, already in its user's language). The red
   border is then never color alone, and aria-invalid and the description follow it, as they do for an error you pass
   (modern web guidance, required-field-feedback). It's read again on every edit, so it goes once the value is fine,
   and on the form's reset. An error you pass, or a FormErrors message, wins. */
function useNativeError(on: boolean) {
  const say = useSettings(inputWords).labels.invalidValue, locale = useLocale();
  const [text, setText] = React.useState('');
  const root = React.useRef<HTMLElement | null>(null);
  const words = React.useRef({ say, locale });
  React.useInsertionEffect(function () { words.current = { say, locale }; });   // every render: the latest words, for the listeners
  React.useEffect(function () {
    const el = root.current;
    if (!on || !el) return;
    let timer = 0;
    // After the event has done its work: a submit marks every control touched before :user-invalid is read.
    const read = function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        const bad = el.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(':user-invalid');
        const msg = !bad ? '' : (!bad.validity.customError && problemText(bad, words.current.say, words.current.locale)) || bad.validationMessage;
        setText(msg);
      });
    };
    const form = el.closest('form');
    const types = ['focusout', 'change', 'input'];
    types.forEach(function (t) { el.addEventListener(t, read); });
    el.addEventListener('invalid', read, true);   // invalid doesn't bubble
    if (form) form.addEventListener('reset', read);
    return function () {
      window.clearTimeout(timer);
      types.forEach(function (t) { el.removeEventListener(t, read); });
      el.removeEventListener('invalid', read, true);
      if (form) form.removeEventListener('reset', read);
    };
  }, [on]);
  return { text: on ? text : '', root };
}
function useRoot(ref: React.Ref<HTMLElement> | undefined, ownRef: React.RefObject<HTMLElement | null>) {
  return useMergedRef(ref, function (node: HTMLElement | null) { ownRef.current = node; });
}

// The edit listeners on the Field's own element, after any of yours: input (typing) and change (a checkbox, a select).
function listen(rest: { onInput?: React.FormEventHandler<HTMLElement>; onChange?: React.FormEventHandler<HTMLElement> }, edited: (() => void) | undefined) {
  if (!edited) return {};
  return {
    onInput: (e: React.FormEvent<HTMLElement>) => { if (rest.onInput) rest.onInput(e); edited(); },
    onChange: (e: React.FormEvent<HTMLElement>) => { if (rest.onChange) rest.onChange(e); edited(); },
  };
}

export interface FormErrorsProps {
  /** The form's errors by field name, as the server sent them after a submit: { email: "That email is taken" }. Each
   *  Field inside shows its own, and an ErrorSummary inside with no errors of its own lists them all. A new object
   *  (the next submit) shows them all again; null or {} clears them. */
  errors?: Readonly<Record<string, React.ReactNode>> | null | undefined;
  /** The form, or the part of it the errors are about. */
  children?: React.ReactNode | undefined;
}

/* FormErrors: one map of a form's errors by field name, usually what the server answered a submit with. It renders
   nothing of its own. Each Field inside finds its message by its control's name (or its own name prop) and shows it
   as its error, with aria-invalid and the message in the control's description; editing the field takes its message
   away, since it was about the value that was sent. An ErrorSummary inside with no errors prop lists the messages
   still showing, each linking to its field, and takes focus when a new errors object arrives. */
/** A form's errors by field name, from the server: each Field inside shows its own, and an ErrorSummary lists them. */
export function FormErrors(props: FormErrorsProps): React.ReactElement {
  const value = useFormErrors(props.errors);
  return <FormErrorsContext.Provider value={value}>{props.children}</FormErrorsContext.Provider>;
}
