import * as React from 'react';
import { isComposing } from './ime';

type PickerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** The component's block class: the button is `<block>__button`. */
  block: string;
  buttonRef: React.Ref<HTMLButtonElement>;
  open: boolean;
  /** The popup's id, named by aria-controls while it is open. */
  panelId: string;
  invalid: boolean;
  required: boolean;
  readOnly: boolean;
  disabled: boolean;
  onOpen: () => void;
  onClose: () => void;
};

/* The button a popup picker opens from (CascadeSelect, PeriodPicker): a combobox that opens a dialog, on a click or
   on ArrowDown or ArrowUp, and closes it on a second click. The app's own onClick and onKeyDown run first and can
   prevent it. */
export function PickerButton({ block, buttonRef, open, panelId, invalid, required, readOnly, disabled, onOpen, onClose, lang, children, ...rest }: PickerButtonProps) {
  return (
    <button {...rest} ref={buttonRef} type="button" role="combobox" className={block + '__button'} lang={lang}
      aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? panelId : undefined} aria-invalid={invalid || undefined} aria-required={rest['aria-required'] ?? (required || undefined)} aria-readonly={readOnly || undefined} disabled={disabled}
      onClick={(e) => { if (rest.onClick) rest.onClick(e); if (!e.defaultPrevented) { if (open) onClose(); else onOpen(); } }}
      onKeyDown={(e) => { if (rest.onKeyDown) rest.onKeyDown(e); if (!e.defaultPrevented && !open && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && !isComposing(e)) { e.preventDefault(); onOpen(); } }}>
      {children}
    </button>
  );
}

/* required on a picker: a hidden-from-view field the form checks (remade when it fills or empties, so no change
   handler); the button is marked and takes focus instead of a bubble (useRequired). */
export function PickerValidity({ block, required, filled, disabled, form, onInvalid }: { block: string; required: boolean; filled: boolean; disabled: boolean; form?: string; onInvalid: (e: React.FormEvent<HTMLInputElement>) => void }) {
  return required ? <input key={filled ? 'filled' : 'empty'} className={block + '__validity'} tabIndex={-1} aria-hidden required defaultValue={filled ? 'filled' : ''} disabled={disabled} form={form} onInvalid={onInvalid} /> : null;
}
