# DescriptionList

A list of terms and their details: a record's fields on a detail page, an order's subtotal and total, a dialog of keyboard shortcuts. It is a real `<dl>`, so screen readers announce a list and pair each term with its details, and it lays them out three ways, with long values wrapping and every side mirrored in right-to-left.

```tsx
import { DescriptionList, DescriptionItem } from "serupa-ds";

<DescriptionList>
  <DescriptionItem term="Owner">Ayu Lestari</DescriptionItem>
  <DescriptionItem term="Created"><time dateTime="2026-03-14">14 March 2026</time></DescriptionItem>
</DescriptionList>

<DescriptionList layout="split" dividers>
  <DescriptionItem term="Subtotal">Rp 240.000</DescriptionItem>
  <DescriptionItem term="Total" emphasis>Rp 240.000</DescriptionItem>
</DescriptionList>
```

## When to use

- Read-only fields of one thing: a project's owner and dates, a customer's contact details, an invoice's terms.
- Label and value pairs in a summary: totals in a cart or checkout, the settings a plan includes.
- Inline editing inside a value: put [InlineEdit](../InlineEdit/README.md) in the details.

## When not to use

- Many records with the same fields, to compare: use [Table](../Table/README.md).
- Fields a person fills in: use [Field](../Field/README.md) with its inputs.

## Anatomy

Drawn from the `Default` story.

1. **List** (`.dk-description-list`): the `<dl>`, a term beside its details from 480px wide, under it when narrower.
2. **Item** (`.dk-description-list__item`): one term and its details, in a `<div>`.
3. **Term** (`.dk-description-list__term`): the `<dt>`, what the value is, muted and medium weight.
4. **Details** (`.dk-description-list__details`): the `<dd>`, the value itself.

## Usage

- **Layouts:** `inline` (default) puts the term in a column a third of the list wide, beside its details, and stacks them when the list is under 480px wide (a container query, so a list in a narrow card stacks on a wide screen too). `stacked` always puts the term above. `split` puts the details at the end of the term's row, in tabular figures, and moves them under it when both don't fit: totals, settings, shortcuts.
- **Dividers:** `dividers` draws a hairline between items, with the item gap above and below each.
- **Emphasis:** `emphasis` on an item makes it larger and semibold: the total under the subtotals.
- **Long values** wrap anywhere, so a long URL or a long word doesn't widen the list or the page.
- **Text size** follows the surrounding text: put the list in `text-sm` for a compact summary.
- Write terms as short nouns ("Owner", not "The owner of this project is"). Show an empty value as a dash or "Not set", never as nothing, so the term isn't left alone.

### Loading and failed

- **Loading:** show the terms, which you already know, and a skeleton [Loader](../Loader/README.md) in each item's details, with `aria-busy` on the list. Pick the Loader's `size` by the list's text size (`sm` for `text-xs`, `md` for `text-sm`, `lg` for `text-base`): each skeleton line is as tall as a line of that text, so the rows don't move when the details arrive. Give the first Loader a `label` ("Loading order") and the others `label=""`: a screen reader hears the wait once, after the loader's delay, and a quick load says nothing.
- **Failed:** in place of the list, a danger [Alert](../Alert/README.md) that says what didn't load and offers Retry in `actions`. It's `role="alert"`, so the failure is heard as it appears. On Retry, go back to loading.

```tsx
{state === 'failed' ? <Alert tone="danger" actions={<Button size="sm" onClick={load}>Retry</Button>}>The order didn't load.</Alert>
  : <DescriptionList aria-busy={state === 'loading' || undefined}>
      {FIELDS.map((f, i) => (
        <DescriptionItem key={f.key} term={f.term}>
          {state === 'loading' ? <Loader variant="skeleton" size="md" label={i === 0 ? 'Loading order' : ''} /> : order[f.key]}
        </DescriptionItem>
      ))}
    </DescriptionList>}
```

## Accessibility

- **Role and name:** a `<dl>` with `<dt>` terms and `<dd>` details; each pair is wrapped in a `<div>`, which HTML allows in a `<dl>`. Give the list a heading before it, or `aria-label`, when the page has several.
- **Keyboard:** nothing of its own to focus; links and controls in the details are in the Tab order as usual.
- **Contrast:** terms and details read 4.5:1 on the page in all six themes (`DescriptionList.test.tsx`).
- **Right to left:** every side is logical, so the term column and the split details mirror.
- **What's still yours:** terms that make sense on their own, and a text value for anything shown only as an icon or color.

## Props

### DescriptionList

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `layout` | `'inline'` \| `'stacked'` \| `'split'` | `'inline'` | How a term sits beside its details |
| `dividers` | `boolean` | `false` | A hairline between items |
| `children` | `ReactNode` | | DescriptionItem elements |
| `id` | string | none | Goes to the `<dl>`. |

`className`, `ref` and other props go to the `<dl>`.

### DescriptionItem

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `term` | `ReactNode` | | The term, in the `<dt>` |
| `children` | `ReactNode` | | The details, in the `<dd>` |
| `emphasis` | `boolean` | `false` | A larger, semibold row, such as a total |

`className`, `ref` and other props go to the item's `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one DescriptionList. The list lives in `src/components/DescriptionList/description-list.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from description-list.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--description-list-text` | `text` | The list's text. |
| `--description-list-term` | `text` | The terms (4.5:1 on surface). |
| `--description-list-details` | `text` | The details (4.5:1 on surface). |
| `--description-list-divider` | `border` | The hairline between items with dividers. |
| `--description-list-term-weight` | `font-medium` | The terms' weight in inline and stacked (500). |
| `--description-list-gap` | `spacing-3` | Space between items, and above and below each with dividers (12px). |
| `--description-list-term-gap` | `spacing-1` | Space between a term and its details when stacked (4px). |
| `--description-list-column-gap` | `spacing-6` | Space between the term and details columns in inline and split (24px). |
<!-- token-table:end -->
