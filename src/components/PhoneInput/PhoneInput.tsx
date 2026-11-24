'use client';
import * as React from 'react';
import { useControlSize } from '../../internal/controlSize';
import { pressFocuses } from '../../internal/affix';
import { useMergedRef, cn, domId, isInvalid, omit, oneOf, SIZES } from '../../internal/cn';
import { Icon } from '../Icon/Icon';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import type { InputProps } from '../Input/Input';
import { named } from '../../internal/component';
import { activeIn } from '../../internal/root';
import { useFieldControl } from '../../internal/field';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { useLocale, useSettings } from '../../internal/provider';
import { collatorFor } from '../../internal/collator';
import * as icons from '../../material/builtin';
import { warnOnce } from '../../internal/warn';
import { useFormReset } from '../../internal/useFormReset';
import { latinDigits } from '../../internal/digits';
import { PHONE_COUNTRIES, formatNational, isPhoneComplete, parsePhone, phoneCountry, phoneOnly, stripTrunk, toE164, type PhoneCountry } from './phone';
import { en as words } from './labels';
import { isComposing } from '../../internal/ime';
import { fold } from '../../internal/fold';
import { announce } from '../../internal/announce';
import { announcePause } from '../../internal/timing';
import { displayNumber } from '../../internal/numbers';
import { useAnchoredLayer } from '../../internal/useAnchoredLayer';
import { en as listWords } from '../Combobox/labels';

/** What onValueChange reports with the E.164 number. */
export interface PhoneValueDetails {
  /** The picked country's ISO code, such as "ID". */
  country: string;
  /** The national number, digits only, without the trunk prefix. */
  national: string;
  /** Whether the number has a length the country uses. */
  complete: boolean;
}

export interface PhoneInputProps extends Omit<InputProps, 'type' | 'actions' | 'showCount' | 'prefix' | 'suffix' | 'value' | 'defaultValue' | 'onChange' | 'startIcon' | 'endIcon'> {
  /** The number in E.164, such as "+6281234567890", or "" (controlled). Use with onValueChange. */
  value?: string | undefined;
  /** The number at first (uncontrolled), in E.164. */
  defaultValue?: string | undefined;
  /** Called with the E.164 number ("" when empty) as people type, paste or change the country. */
  onValueChange?: ((value: string, details: PhoneValueDetails) => void) | undefined;
  /** The picked country, an ISO code such as "ID" (controlled). Use with onCountryChange. */
  country?: string | undefined;
  /** The country at first (uncontrolled). Default: the locale's region when it's known, else "US". */
  defaultCountry?: string | undefined;
  /** Called with the ISO code when the country changes, from the menu or a pasted "+…" number. */
  onCountryChange?: ((country: string) => void) | undefined;
  /** The countries in the menu, as ISO codes or your own PhoneCountry rows (which replace the built-in row with the same code); the menu sorts them by name. Default: every country PhoneInput knows. */
  countries?: Array<string | PhoneCountry> | undefined;
  /** The country menu's name. Default: "Country". */
  countryLabel?: string | undefined;
  /** Submits the E.164 number under this name in a hidden input. */
  name?: string | undefined;
}

const own = { size: 1, invalid: 1, className: 1, style: 1, value: 1, defaultValue: 1, onValueChange: 1, country: 1, defaultCountry: 1,
  onCountryChange: 1, countries: 1, countryLabel: 1, name: 1, onKeyDown: 1 } as const;

const regionOf = (locale: string): string | undefined => {
  try { return new Intl.Locale(locale).maximize().region; } catch { return undefined; }
};

// Where the caret goes after formatting: just after the n-th digit (or at the start for none).
const caretAfter = (text: string, n: number): number => {
  if (n <= 0) return 0;
  for (let i = 0, seen = 0; i < text.length; i++) if (/\d/.test(text.charAt(i)) && ++seen === n) return i + 1;
  return text.length;
};

const keyedCountries = (key: string) => (key ? (JSON.parse(key) as Array<string | PhoneCountry>) : undefined);

function PhoneInputRender({ ref, ...props }: PhoneInputProps & React.RefAttributes<HTMLInputElement>) {
  props = useFieldControl(props);   // the props a surrounding Field hands it, at any depth
  const nameRef = useNameCheck('PhoneInput', NAME_HOW.field);   // warns when it has no accessible name
  const sds = useSettings(words);
  const locale = useLocale();
  const rest = omit(props, own);
  const size = oneOf(SIZES, useControlSize(props.size), 'md');
  const invalid = isInvalid(props.invalid, rest['aria-invalid']);

  const { onCountryChange, onValueChange, onKeyDown: onKeyDownProp } = props;
  // countries by value, as NumberInput's formatOptions: the memos read them back from their key, so an inline list
  // doesn't redo them, and the React Compiler, which can't tell props won't change, keeps the memos.
  const countriesKey = String(props.countries ? JSON.stringify(props.countries) : '');
  // The rows this field knows: the built-in ones, with any rows passed in countries in place of the same code.
  const table = React.useMemo(function () {
    const mine = (keyedCountries(countriesKey) || []).filter((c): c is PhoneCountry => typeof c === 'object' && !!c && !!c.code);
    if (!mine.length) return PHONE_COUNTRIES;
    const codes = new Set(mine.map((c) => c.code.toUpperCase()));
    return mine.map((c) => ({ ...c, code: c.code.toUpperCase() })).concat(PHONE_COUNTRIES.filter((c) => !codes.has(c.code)));
  }, [countriesKey]);
  const find = (code: string | undefined) => (code ? table.find((c) => c.code === code.toUpperCase()) : undefined);
  // Country names come from the runtime's Intl data, and a server's (Node's ICU) words some of them differently from
  // the browser's ("Falkland Islands (Islas Malvinas)"): the list is drawn only when it opens, in the browser.
  const list = React.useMemo(function () {
    const pick = (code: string | undefined) => (code ? table.find((c) => c.code === code.toUpperCase()) : undefined);
    const countries = keyedCountries(countriesKey);
    const picked = countries ? countries.map((c) => pick(typeof c === 'string' ? c : c && c.code)).filter((c): c is PhoneCountry => !!c) : table.slice();
    const order = collatorFor(locale);
    let names: Intl.DisplayNames | undefined;
    try { names = new Intl.DisplayNames([locale], { type: 'region' }); } catch { names = undefined; }
    return picked.map((c) => ({ c, name: (names && names.of(c.code)) || c.code })).sort((a, b) => order.compare(a.name, b.name));
  }, [countriesKey, table, locale]);
  const fallback = find(props.defaultCountry) || find(regionOf(locale)) || find('US') || phoneCountry('US')!;
  const start = parsePhone(props.value ?? props.defaultValue ?? '', props.country ?? props.defaultCountry, table);

  const [ownCountry, setOwnCountry] = React.useState<string>(() => (start ? start.country.code : fallback.code));
  const country = find(props.country) || find(ownCountry) || fallback;
  const [national, setNational] = React.useState(() => (start ? start.national : ''));
  // A calling code being typed ("+", "+4", "00"): shown as typed until it names a country, which it then picks, as a
  // pasted "+44 …" does. Without it the lone "+" formats to nothing, and "+44 20…" became a US number (GR83).
  const [lead, setLead] = React.useState<string | null>(null);
  // The digits as last typed, pasted or set: a new country cuts the number to its length from these, so arrowing
  // through the menu (a change per arrow) doesn't leave it cut to the shortest country passed on the way.
  // State, not refs, as a value from outside sets them while rendering.
  const [typed, setTyped] = React.useState(national);
  // A controlled value that changed from outside (not the one this field just reported) is read again.
  const [reported, setReported] = React.useState(() => (start ? toE164(start.national, start.country) : ''));
  let shown = national;
  if (props.value !== undefined && props.value !== reported) {
    const p = parsePhone(props.value, country.code, table);
    shown = p ? p.national : '';
    setReported(props.value);
    if (shown !== national) { setNational(shown); setTyped(shown); }
    if (p && p.country.code !== country.code && props.country === undefined) setOwnCountry(p.country.code);
  }

  const input = React.useRef<HTMLInputElement | null>(null);
  const setRef = useMergedRef(ref, nameRef, input);
  // A form reset puts the default number and country back (uncontrolled), in the field and in what the form sends; a
  // controlled field shows its value again (the browser reset the text to its first value).
  const [, rerender] = React.useState(0);
  useFormReset(input, () => {
    setLead(null);
    if (props.value === undefined) {
      const d = parsePhone(props.defaultValue ?? '', props.defaultCountry, table);
      setNational(d ? d.national : '');
      setTyped(d ? d.national : '');
      if (props.country === undefined) setOwnCountry(d ? d.country.code : fallback.code);
      setReported(d ? toE164(d.national, d.country) : '');
    }
    rerender((n) => n + 1);
  });
  const caret = React.useRef<number | null>(null);
  const text = lead != null && !shown ? lead : formatNational(shown, country);
  // every render: an edit that reformats the number asks for the caret back, and the new text is there only after the render.
  React.useLayoutEffect(function () {
    if (caret.current == null || !input.current || activeIn(input.current) !== input.current) return;   // its own root's focus, in a shadow root too (GR90)
    input.current.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });

  const commit = function (digits: string, c: PhoneCountry, picked?: boolean) {
    digits = digits.slice(0, c.max);
    setLead(null);
    if (!picked) setTyped(digits);
    setNational(digits);
    if (c.code !== country.code) {
      if (props.country === undefined) setOwnCountry(c.code);
      onCountryChange?.(c.code);
    }
    const e164 = toE164(digits, c);
    if (e164 !== reported || c.code !== country.code) {
      setReported(e164);
      onValueChange?.(e164, { country: c.code, national: digits, complete: isPhoneComplete(digits, c) });
    }
    return digits;
  };

  const onChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    // Digits in any script as ASCII, and full-width "＋" and digits as the usual ones: an Arabic or Persian keyboard
    // types ٠٨١٢, a Japanese IME ０８１２, and they're the same number (GR43). One character stays one, so the caret holds.
    // A pasted tel: link or a number with an extension keeps only the number (GR128, GR129).
    const raw = phoneOnly(latinDigits(e.target.value.normalize('NFKC'))), at = Math.min(e.target.selectionStart ?? raw.length, raw.length);
    let before = raw.slice(0, at).replace(/\D/g, '').length;
    // A lone "0" waits as typed, so the "00" of "0044" can come together: where it's the trunk prefix (Germany) it
    // stripped to nothing, and the +1 pattern wrote it "(0" (GR85). The next digit decides what it was: "06" is still
    // Rome's number in Italy.
    if (raw.trim() === '0') { commit('', country); setLead('0'); caret.current = 1; return; }
    if (/^\s*(\+|00)/.test(raw)) {
      const p = parsePhone(raw, country.code, table);
      if (p) { const d = commit(p.national, p.country); caret.current = formatNational(d, p.country).length; return; }
      // Only the start of a calling code so far: keep it in the field, and the number empty, until it names a country.
      const code = raw.trim();
      if (/^(\+|00)\d{0,3}$/.test(code)) { commit('', country); setLead(code); caret.current = code.length; return; }
      if (process.env.NODE_ENV !== 'production' && raw.replace(/\D/g, '').length > 3) warnOnce('phone-code', `PhoneInput: "${raw.trim()}" starts with a calling code PhoneInput doesn't know, so its digits are read as a number in ${country.code}. Pass the country's row in countries.`);
    }
    const all = raw.replace(/\D/g, '');
    let digits = stripTrunk(all, country);
    // Too long for a national number but starts with the calling code ("62 812…" typed with Indonesia picked): the
    // code was typed without "+", so it's dropped rather than written twice.
    if (digits.length > country.max && all.startsWith(country.dial)) digits = stripTrunk(all.slice(country.dial.length), country);
    if (digits.length < all.length) before = Math.max(0, before - (all.length - digits.length));
    const d = commit(digits, country);
    caret.current = caretAfter(formatNational(d, country), Math.min(before, d.length));
  };

  // Backspace or Delete next to a separator ("812-|3456") removes the digit beyond it, not only the separator.
  const onKeyDown = function (e: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDownProp?.(e);
    const el = e.currentTarget, s = el.selectionStart, end = el.selectionEnd;
    // With Alt, Ctrl or ⌘ held, Backspace and Delete take a word or the line: the browser's, not one digit (L8E30).
    // A readOnly field takes no edit from them either (L8E69), and while an input method is composing they edit the
    // composition (Safari sends the keydown with isComposing).
    if (e.defaultPrevented || el.readOnly || isComposing(e) || e.altKey || e.ctrlKey || e.metaKey || s == null || s !== end || (e.key !== 'Backspace' && e.key !== 'Delete')) return;
    const back = e.key === 'Backspace';
    let i = back ? s - 1 : s;
    if (i < 0 || i >= text.length || /\d/.test(text.charAt(i))) return;
    while (i >= 0 && i < text.length && !/\d/.test(text.charAt(i))) i += back ? -1 : 1;
    if (i < 0 || i >= text.length) return;
    e.preventDefault();
    const n = text.slice(0, i).replace(/\D/g, '').length;   // digits before the one removed
    commit(shown.slice(0, n) + shown.slice(n + 1), country);
    caret.current = caretAfter(formatNational(shown.slice(0, n) + shown.slice(n + 1), country), n);
  };

  // The country menu: a button showing the calling code, that opens a list of the countries with a search field at
  // its top (the search is a combobox for the listbox under it). Picking one puts focus back in the number.
  const L = useSettings(listWords).labels;
  const label = props.countryLabel || sds.labels.country;
  const base = domId('srp-phone', React.useId()), listId = base + '-list';
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const locked = !!(rest.disabled || rest.readOnly);
  const shownList = useFiltered(list, open ? query : '');
  const here = list.find((x) => x.c.code === country.code);
  const trigger = React.useRef<HTMLButtonElement | null>(null), pop = React.useRef<HTMLDivElement | null>(null), search = React.useRef<HTMLInputElement | null>(null);
  const boxRef = React.useRef<HTMLSpanElement | null>(null);
  const show = (text: string) => {
    if (locked) return;
    setQuery(text);
    const at = text ? 0 : list.findIndex((x) => x.c.code === country.code);
    setActive(Math.max(0, at));
    setOpen(true);
  };
  const close = (back: 'trigger' | 'field' | null) => {
    setOpen(false);
    if (back === 'trigger' && trigger.current) trigger.current.focus();
    if (back === 'field' && input.current) input.current.focus();
  };
  const choose = (c: PhoneCountry) => { commit(typed, c, true); close('field'); };
  useAnchoredLayer(open, pop, boxRef, { placement: 'bottom-start', offsetVar: '--srp-phone-input-offset', watch: shownList.length, inside: trigger,
    onOutside: () => setOpen(false), onFocusOutside: () => setOpen(false) });
  // Once the list is shown and placed: focus goes to its search field.
  useFocusOnOpen(open, search);
  // The highlighted country stays in view as the arrows move it.
  React.useLayoutEffect(function () {
    if (!open) return;
    const o = document.getElementById(base + '-opt-' + active);
    if (o && typeof o.scrollIntoView === 'function') o.scrollIntoView({ block: 'nearest' });
  }, [open, active, base]);
  // How many match, said after a pause in typing, as Combobox says it.
  const said = !open || !query ? '' : shownList.length ? L.resultsCount(shownList.length, displayNumber(shownList.length, locale)) : L.noResults;
  React.useEffect(function () {
    if (!said) return;
    const t = setTimeout(() => announce(said), announcePause);
    return () => clearTimeout(t);
  }, [said]);

  const onTriggerKey = function (e: React.KeyboardEvent<HTMLButtonElement>) {
    if (locked || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); show(''); }
    else if (e.key.length === 1 && e.key !== ' ' && !isComposing(e)) { e.preventDefault(); show(e.key); }   // typing on it starts the search
  };
  const onSearchKey = function (e: React.KeyboardEvent<HTMLInputElement>) {
    if (isComposing(e)) return;
    const n = shownList.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (n) setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + n) % n);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const x = shownList[active];
      if (x) choose(x.c);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();   // a dialog the field is in stays open
      close('trigger');
    } else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <span ref={boxRef} className={cn('srp-input srp-phone-input', 'srp-input--size-' + size, invalid && 'srp-input--invalid', rest.disabled && 'srp-input--disabled', rest.readOnly && 'srp-input--readonly', props.className)}
      style={props.style} data-component="phone-input" data-size={size} data-state={open ? 'open' : 'closed'} onMouseDown={(e) => pressFocuses(input)(e)}>
      <button ref={trigger} type="button" className="srp-phone-input__country" disabled={locked} data-value={country.code}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
        onClick={() => (open ? close(null) : show(''))} onKeyDown={onTriggerKey}>
        {/* Named by its text, the visible code included, so what people see is what a voice command says (WCAG 2.5.3). */}
        <VisuallyHidden suppressHydrationWarning>{label + ': ' + (here ? here.name : country.code) + ' '}</VisuallyHidden>
        <span className="srp-phone-input__dial">+{country.dial}</span>
        <Icon icon={icons.ExpandMore} className="srp-phone-input__chevron" />
      </button>
      <input autoComplete="tel" {...rest} aria-invalid={invalid || rest['aria-invalid']} ref={setRef} type="tel" inputMode="tel" className="srp-input__field" value={text} onChange={onChange} onKeyDown={onKeyDown} />
      {props.name ? <input type="hidden" name={props.name} form={props.form} value={toE164(shown, country)} disabled={rest.disabled} /> : null}
      <div ref={pop} className="srp-phone-input__popup" {...{ popover: 'manual' }} hidden={!open || undefined} onMouseDown={(e) => e.stopPropagation()}>
        {open ? (
          <>
            <span className="srp-phone-input__search-box">
              <Icon icon={icons.Search} className="srp-phone-input__search-icon" />
              <input ref={search} className="srp-phone-input__search" type="text" role="combobox" aria-label={label} aria-expanded aria-controls={listId}
                aria-autocomplete="list" aria-activedescendant={shownList[active] ? base + '-opt-' + active : undefined} autoComplete="off" spellCheck={false}
                value={query} onChange={(e) => { setQuery(e.target.value); setActive(0); }} onKeyDown={onSearchKey} />
            </span>
            <div id={listId} role="listbox" aria-label={label} className="srp-phone-input__listbox">
              {shownList.map((x, i) => (
                <div key={x.c.code} id={base + '-opt-' + i} role="option" aria-selected={x.c.code === country.code} data-value={x.c.code}
                  className={cn('srp-phone-input__option', i === active && 'srp-phone-input__option--active')}
                  onMouseDown={(e) => e.preventDefault()} onMouseMove={() => { if (i !== active) setActive(i); }} onClick={() => choose(x.c)}>
                  <span className="srp-phone-input__name">{x.name}</span>
                  <span className="srp-phone-input__code">+{x.c.dial}</span>
                  {x.c.code === country.code ? <Icon icon={icons.Check} className="srp-phone-input__check" /> : <span className="srp-phone-input__check" />}
                </div>
              ))}
            </div>
            {!shownList.length ? <div className="srp-phone-input__message">{L.noResults}</div> : null}
          </>
        ) : null}
      </div>
    </span>
  );
}

// The countries whose name, ISO code or calling code holds what's typed: names ignoring case and accents ("cote"
// finds Côte d'Ivoire), codes from the start ("+62", "62" and "id" find Indonesia); those starting with it first. Kept
// until the list or text change.
function useFiltered(list: readonly { c: PhoneCountry; name: string }[], query: string) {
  return React.useMemo(function () {
    const q = fold(query.trim());
    if (!q) return list;
    const digits = q.replace(/^\+/, '');
    const starts: typeof list[number][] = [], inside: typeof list[number][] = [];
    for (const x of list) {
      const name = fold(x.name);
      if (name.startsWith(q) || x.c.code.toLowerCase() === q || (/^\d+$/.test(digits) && x.c.dial.startsWith(digits))) starts.push(x);
      else if (name.includes(q)) inside.push(x);
    }
    return starts.concat(inside);   // names that start with it first: "ind" is India and Indonesia before British Indian Ocean Territory
  }, [list, query]);
}

// Focus to the list's search field once it is shown (after useAnchoredLayer's effect, which shows and places it).
function useFocusOnOpen(open: boolean, search: React.RefObject<HTMLInputElement | null>) {
  React.useLayoutEffect(function () { if (open && search.current) search.current.focus(); }, [open, search]);
}

/* PhoneInput: Input's box with a country menu at the start (a "+62" button that opens a searchable list) and a tel field
   that groups the national number as people type ("812-3456-7890"). onValueChange reports E.164 ("+6281234567890").
   Pasting or typing "+…" picks the country from the calling code; a typed trunk "0" is dropped. className and
   style go to the box; ref and the other input props to the tel <input>. */
/** A phone number field: a country menu and a tel field that groups the number as people type, reporting E.164 ("+6281234567890"). */
export const PhoneInput = /* @__PURE__ */ named('PhoneInput', PhoneInputRender);
