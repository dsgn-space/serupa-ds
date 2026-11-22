// State is an attribute, not a class (ADR-0022): the components' stylesheets select a state on the attribute the element
// carries (data-disabled, data-selected, data-current, aria-expanded, data-state…), and the --state modifier classes
// they still write are deprecated, removed in 18.0.0, so app CSS moves off them first. This fails when a stylesheet
// under src/ selects one of them again, and when a component writes one of the classes without the attribute that
// replaces it, so an app selecting on the attribute never misses an element.
//   node tools/test/state-hooks.mjs
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT, report, done } from './lib.mjs';

/** Each deprecated state class, and the attribute selector on the same element that replaces it. */
export const STATE_CLASSES = {
  'srp-accordion__item--open': '[data-state="open"]',
  'srp-attachment--error': '[data-error]',
  'srp-badge--loading': '[data-loading]',
  'srp-bottom-nav__link--active': '[data-current]',
  'srp-breadcrumb__item--current': '[data-current]',
  'srp-btn--loading': '[data-loading]',
  'srp-calendar__day--disabled': '[data-disabled]',
  'srp-calendar__day--outside': '[data-outside]',
  'srp-calendar__day--selected': '[data-selected]',
  'srp-calendar__day--today': '[data-today]',
  'srp-calendar__period--disabled': '[data-disabled]',
  'srp-calendar__period--selected': '[data-selected]',
  'srp-calendar__period--today': '[data-today]',
  'srp-cascade-select--disabled': '[data-disabled]',
  'srp-cascade-select--invalid': '[data-invalid]',
  'srp-cascade-select--readonly': '[data-readonly]',
  'srp-cascade-select__value--empty': '[data-empty]',
  'srp-checkbox--invalid': '[data-invalid]',
  'srp-checkbox--readonly': '[data-readonly]',
  'srp-color-picker--disabled': '[data-disabled]',
  'srp-color-picker--readonly': '[data-readonly]',
  'srp-color-picker__swatch--checked': '[data-checked]',
  'srp-combobox__option--active': '[data-active]',
  'srp-command-palette__option--active': '[data-active]',
  'srp-command-palette__option--disabled': '[data-disabled]',
  'srp-data-grid__cell--selected': '[data-selected]',
  'srp-date-field--disabled': '[data-disabled]',
  'srp-event-calendar__agenda-day--today': '[data-today]',
  'srp-event-calendar__day--outside': '[data-outside]',
  'srp-event-calendar__day--today': '[data-today]',
  'srp-event-calendar__event--dragging': '[data-dragging]',
  'srp-event-calendar__head--today': '[data-today]',
  'srp-field--disabled': '[data-disabled]',
  'srp-file-upload--disabled': '[data-disabled]',
  'srp-file-upload--invalid': '[data-invalid]',
  'srp-file-upload--readonly': '[data-readonly]',
  'srp-file-upload__zone--over': '[data-over]',
  'srp-filter-bar__chip--empty': '[data-empty]',
  'srp-image-cropper--disabled': '[data-disabled]',
  'srp-inline-edit--disabled': '[data-disabled]',
  'srp-input--disabled': '[data-disabled]',
  'srp-input--invalid': '[data-invalid]',
  'srp-input--readonly': '[data-readonly]',
  'srp-kanban__card--dragging': '[data-dragging]',
  'srp-kanban__count--over': '[data-over]',
  'srp-list__item--disabled': '[data-disabled]',
  'srp-list__item--selected': '[data-selected]',
  'srp-mention-input__option--active': '[data-active]',
  'srp-navbar__link--active': '[data-current]',
  'srp-navbar__menu-link--active': '[data-current]',
  'srp-pagination__item--current': '[data-current]',
  'srp-period-picker--disabled': '[data-disabled]',
  'srp-period-picker--invalid': '[data-invalid]',
  'srp-period-picker--readonly': '[data-readonly]',
  'srp-period-picker__period--current': '[data-current]',
  'srp-period-picker__period--disabled': '[data-disabled]',
  'srp-period-picker__period--selected': '[data-selected]',
  'srp-period-picker__value--empty': '[data-empty]',
  'srp-pin-input--disabled': '[data-disabled]',
  'srp-pin-input--invalid': '[data-invalid]',
  'srp-pin-input--readonly': '[data-readonly]',
  'srp-pin-input__box--active': '[data-active]',
  'srp-progress--indeterminate': '[data-state="indeterminate"]',
  'srp-radio--invalid': '[data-invalid]',
  'srp-radio--readonly': '[data-readonly]',
  'srp-rating--disabled': '[data-disabled]',
  'srp-rating--readonly': '[data-readonly]',
  'srp-segmented--disabled': '[data-disabled]',
  'srp-segmented--invalid': '[data-invalid]',
  'srp-segmented--readonly': '[data-readonly]',
  'srp-segmented__item--selected': '[data-selected]',
  'srp-select--disabled': '[data-disabled]',
  'srp-select--empty': '[data-empty]',
  'srp-select--invalid': '[data-invalid]',
  'srp-select--readonly': '[data-readonly]',
  'srp-sidebar--collapsed': '[data-collapsed]',
  'srp-sidebar__item--active': '[data-current]',
  'srp-signature-pad--disabled': '[data-disabled]',
  'srp-signature-pad--invalid': '[data-invalid]',
  'srp-signature-pad--readonly': '[data-readonly]',
  'srp-slider--disabled': '[data-disabled]',
  'srp-slider--invalid': '[data-invalid]',
  'srp-slider--readonly': '[data-readonly]',
  'srp-sortable-list--disabled': '[data-disabled]',
  'srp-sortable-list__item--dragging': '[data-dragging]',
  'srp-stepper__step--complete': '[data-state="complete"]',
  'srp-stepper__step--current': '[data-state="current"]',
  'srp-stepper__step--done': '[data-done]',
  'srp-stepper__step--error': '[data-state="error"]',
  'srp-switch--invalid': '[data-invalid]',
  'srp-switch--readonly': '[data-readonly]',
  'srp-table__expand-button--open': '[aria-expanded="true"]',
  'srp-table__row--selected': '[data-selected]',
  'srp-tag-group__tag--selected': '[data-selected]',
  'srp-textarea--disabled': '[data-disabled]',
  'srp-textarea--invalid': '[data-invalid]',
  'srp-textarea--readonly': '[data-readonly]',
  'srp-time-picker__option--active': '[data-active]',
  'srp-toggle-button--pressed': '[aria-pressed="true"]',
  'srp-tree-view__item--disabled': '[data-disabled]',
  'srp-tree-view__item--selected': '[data-selected]',
};

const walk = (dir, keep) => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? (e.name === 'generated' ? [] : walk(p, keep)) : keep(e.name) ? [p] : [];
}) : [];
const SRC = path.join(PROJECT, 'src');
const rel = (p) => path.relative(PROJECT, p);
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const R = [];
const t = (name, ok, detail) => R.push({ name, ok: !!ok, detail });

for (const f of walk(SRC, (n) => n.endsWith('.css'))) {
  const css = strip(fs.readFileSync(f, 'utf8'));
  const used = Object.keys(STATE_CLASSES).filter((c) => new RegExp('\\.' + esc(c) + '(?![\\w-])').test(css));
  t(`${rel(f)} selects state on attributes, not on a deprecated --state class`, !used.length,
    used.map((c) => `.${c}: use ${c.split('--')[0]}${STATE_CLASSES[c]}`).join('; '));
}
for (const f of walk(SRC, (n) => /\.tsx$/.test(n) && !/\.(test|stories)\.tsx$/.test(n))) {
  const code = fs.readFileSync(f, 'utf8');
  const missing = Object.entries(STATE_CLASSES).filter(([c, sel]) => new RegExp(`['"\\s]${esc(c)}['"\\s]`).test(code)
    && !code.includes(/^\[([\w-]+)/.exec(sel)[1])).map(([c, sel]) => `${c} without ${sel}`);
  if (missing.length || Object.keys(STATE_CLASSES).some((c) => code.includes(c))) t(`${rel(f)} writes the attribute beside each deprecated state class`, !missing.length, missing.join('; '));
}
done(report('State as attributes', R));
