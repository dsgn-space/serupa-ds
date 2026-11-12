# Quote

Quoted words with who said them, for a testimonial, a pull quote, or a quote in a page that isn't [Prose](../Prose/README.md).

**Also called:** Blockquote, Testimonial, Pull quote.

```tsx
import { Quote, Avatar } from "serupa-ds";

<Quote author="Ada Rahman" source="Head of Product, Lumen">
  We moved our settings onto it in a week.
</Quote>
<Quote size="lg" author="Ada Rahman" source="Lumen" avatar={<Avatar name="Ada Rahman" size="md" alt="" />}>
  The support tickets stopped.
</Quote>
```

## When to use

- A customer's or a person's words on a marketing page, a pricing page or an empty state: a testimonial.
- A line pulled out of an article to catch the eye, with `size="lg"`.
- A quote inside an app's own layout, such as a review shown on a product page.

## When not to use

- A quote inside long-form text already rendered by [Prose](../Prose/README.md): write a plain `<blockquote>` and Prose styles it.
- A message in a conversation: use [Chat](../Chat/README.md).
- A warning or a note that stands out from the text: use an [Alert](../Alert/README.md).
- Code or a log: use a [CodeBlock](../CodeBlock/README.md).

## Anatomy

Drawn from the `Large` story.

1. **Rule** (`.dk-quote`): a line along the start edge, as Prose draws a quote.
2. **Words** (`.dk-quote__text`): the `<blockquote>`.
3. **Caption** (`.dk-quote__by`): the `<figcaption>`, with the optional picture before the name.
4. **Author** (`.dk-quote__author`): who said it.
5. **Source** (`.dk-quote__source`): their role and company, or where it's from.

## Usage

- Quote people word for word. Cut with "…" rather than rewording, and get their permission to show their name and picture.
- Keep testimonials short: two or three sentences read; a paragraph gets skipped.
- `author` is who said it. `source` is their role and company, or the book, talk or review it's from. Either can be left out; with neither, there's no caption.
- A string becomes one paragraph. Pass `<p>` elements for several.
- `cite` records the source's URL on the `<blockquote>`, but browsers don't show it. When people should be able to read the original, put a [Link](../Link/README.md) in `source`.
- Pass the avatar with `alt=""`: the name is already written beside it.
- Don't add quotation marks around the words: the rule already says it's a quote, and marks differ by language.
- There's no Video component. For a video testimonial, use a `<video>` with `controls`, captions in a `<track kind="captions">`, and no autoplay with sound, and put its Quote of the key line beside it.

## Accessibility

- **Role and name:** a `<figure>` holding a `<blockquote>` and a `<figcaption>`, so the attribution is announced with the quote but isn't part of it.
- **Keyboard:** none: it isn't focusable. Links inside it are focused as usual.
- **Contrast:** its words and its source read 4.5:1 on the page's surface in all six themes (`Quote.test.tsx`). The rule is decoration, so it has no minimum; in forced-colors mode it takes the text color.
- **Right to left:** the rule is on the start edge, so it moves to the right in right-to-left text.
- **What's still yours:** the words and their source, and a translated quote's original language in `lang` when you show it untranslated.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the `<figure>`. |
| `children` | `ReactNode` | | The quoted words. A string becomes one `<p>`. |
| `author` | `ReactNode` | | Who said it. |
| `source` | `ReactNode` | | Their role and company, or where it's from. |
| `avatar` | `ReactNode` | | A picture before who said it, such as an [Avatar](../Avatar/README.md) with `alt=""`. |
| `cite` | `string` | | The source's URL, for `<blockquote cite>`. Not shown. |
| `size` | `'md' \| 'lg'` | `'md'` | `'lg'` sets the words larger, for a pull quote. |

`className`, `ref` and other props go to the `<figure>`, which has `data-component="quote"`.

## Component tokens

Each is an optional override: set it on the page, a container or one Quote. The list lives in `src/components/Quote/quote.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from quote.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--quote-text` | `text` | The quoted words (4.5:1 on the page's surface). |
| `--quote-source` | `text-muted` | Who said it and where (4.5:1 on the page's surface). |
| `--quote-border` | `border-strong` | The rule along the quote's start edge. |
| `--quote-border-width` | `border-width-4` | The rule's width (4px). |
| `--quote-indent` | `spacing-4` | Space between the rule and the words (16px). |
| `--quote-gap` | `spacing-3` | Space between the words and who said them, and between a picture and the name (12px). |
| `--quote-author-weight` | `font-semibold` | The weight of who said it. |
| `--quote-size-lg` | `text-xl` | The words' size in a large (pull) quote (text-xl). |
| `--quote-line-height-lg` | `text-xl--line-height` | The words' line height in a large quote (text-xl's). |
<!-- token-table:end -->
