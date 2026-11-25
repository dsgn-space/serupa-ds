---
"@diki-stwn/serupa-ds": minor
---

PhoneInput: the country menu is now Serupa's own searchable list instead of the browser's native picker. The "+62" button opens a list of the countries with a search field at its top: type a name, an ISO code or a calling code to find one. The box draws the one focus ring for the menu and the number alike, and the menu shades while it has focus. New tokens for the list: `--phone-input-listbox-bg`, `-listbox-border`, `-listbox-shadow`, `-listbox-radius`, `-listbox-max-height`, `-option-color`, `-option-bg-active`, `-option-indicator`, `-muted`, `-offset` and `-z-index`; `--phone-input-focus-ring` now colors the box's ring while the menu has focus.
