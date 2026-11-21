/* A form's values, read from its controls (Form). Every Serupa field is a native control underneath, or keeps a hidden
   input with its name (Combobox, DatePicker, NumberInput), so the form itself is the one place every value is: no
   field needs wiring. Names are paths, "address.city" or FieldList's "addresses[1].city", and the values come back as
   the object a schema checks: { address: { city } }, { addresses: [{ city }] }. */

/** A form's values by path ("addresses.1.city"), as its controls hold them. */
export type FlatValues = Map<string, unknown>;

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
// Controls that hold no value of their own.
const SKIP = new Set(['submit', 'button', 'reset', 'image', 'fieldset', 'output', 'object']);
// Never a key: an object's own machinery.
const UNSAFE = new Set(['__proto__', 'prototype', 'constructor']);

/** A control's name as a path: "addresses[1].city" and "addresses.1.city" are both "addresses.1.city"; "tags[]" is "tags". */
export function pathKey(name: string): string {
  return name.replace(/\[([^\]]*)\]/g, (_, k: string) => (k ? '.' + k : '')).replace(/^\./, '');
}

/** A schema issue's path as the same kind of key: ['addresses', 1, 'city'] is "addresses.1.city". */
export function issueKey(path: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined): string {
  return (path || []).map((p) => String(typeof p === 'object' && p !== null ? p.key : p)).join('.');
}

/** Every named control's value: a checkbox on its own is true or false, a set of checkboxes with one name the values
 *  checked, radios the one checked (or undefined), a multiple select its selected values, a file input its file (or
 *  files), and anything else its text. A disabled control is left out, as a submit leaves it out. */
export function readFlat(form: HTMLFormElement): FlatValues {
  const groups = new Map<string, Control[]>();
  for (const el of Array.from(form.elements) as Control[]) {
    if (!el.name || SKIP.has(el.type) || el.matches(':disabled')) continue;
    const k = pathKey(el.name), list = groups.get(k);
    if (list) list.push(el); else groups.set(k, [el]);
  }
  const out: FlatValues = new Map();
  groups.forEach((els, k) => { out.set(k, valueOf(els)); });
  return out;
}

function valueOf(els: Control[]): unknown {
  const first = els[0] as HTMLInputElement;
  if (els.every((e) => e.type === 'checkbox')) {
    const boxes = els as HTMLInputElement[];
    if (boxes.length === 1 && (!first.hasAttribute('value') || first.value === 'on')) return first.checked;
    return boxes.filter((b) => b.checked).map((b) => b.value);
  }
  if (els.every((e) => e.type === 'radio')) {
    const on = (els as HTMLInputElement[]).find((r) => r.checked);
    return on ? on.value : undefined;
  }
  return els.length === 1 ? one(first) : els.map(one);
}
function one(e: Control): unknown {
  if (e.tagName === 'SELECT' && (e as HTMLSelectElement).multiple) return Array.from((e as HTMLSelectElement).selectedOptions, (o) => o.value);
  if (e.type === 'file') {
    const files = Array.from((e as HTMLInputElement).files || []);
    return (e as HTMLInputElement).multiple ? files : files[0];
  }
  return e.value;
}

/** The values as the nested object a schema checks. */
export function toNested(flat: FlatValues | Readonly<Record<string, unknown>>): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  const entries = flat instanceof Map ? Array.from(flat) : Object.entries(flat);
  for (const [k, v] of entries) setPath(root, k, v);
  return root;
}
function setPath(root: Record<string, unknown>, key: string, value: unknown) {
  const parts = key.split('.');
  if (parts.some((p) => UNSAFE.has(p))) return;
  let at = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i] as string, next = at[p];
    if (next == null || typeof next !== 'object') at[p] = /^\d+$/.test(parts[i + 1] as string) ? [] : {};
    at = at[p] as Record<string, unknown>;
  }
  at[parts[parts.length - 1] as string] = value;
}

/** The value at a path ("addresses.1.city") in a nested object, or undefined. */
export function getPath(root: unknown, key: string): unknown {
  let at: unknown = root;
  for (const p of key.split('.')) {
    if (at == null || typeof at !== 'object' || UNSAFE.has(p)) return undefined;
    at = (at as Record<string, unknown>)[p];
  }
  return at;
}

/** `over` laid on `base`: objects and arrays merged key by key, anything else from `over`. */
export function merge(base: unknown, over: unknown): unknown {
  if (over === undefined) return base;
  if (!base || !over || typeof base !== 'object' || typeof over !== 'object') return over;
  const out = (Array.isArray(base) ? base.slice() : { ...base }) as Record<string, unknown>;
  for (const [k, v] of Object.entries(over)) if (!UNSAFE.has(k)) out[k] = merge(out[k], v);
  return out;
}

/** One value, written so two can be compared: files by name, size and date. */
export function same(a: unknown, b: unknown): boolean {
  return a === b || stamp(a) === stamp(b);
}
/** The values written so two sets can be compared. */
export function stamp(v: unknown): string {
  return JSON.stringify(v instanceof Map ? Array.from(v) : v, (_, x: unknown) => (typeof File !== 'undefined' && x instanceof File ? 'file:' + x.name + ':' + x.size + ':' + x.lastModified : x));
}
