# TabNav

Moves between the sub-pages of one thing, such as a project's Overview, Activity and Settings, when each has its own URL. It looks like [Tabs](../Tabs/README.md), but it's a `nav` of links: the current page is marked with `aria-current="page"`, and people move with Tab and follow a link with Enter, as on any link.

```jsx
const { TabNav, TabNavLink } = window.Serupa;

<TabNav aria-label="Project">
  <TabNavLink href="/atlas" current>Overview</TabNavLink>
  <TabNavLink href="/atlas/activity" icon="history">Activity</TabNavLink>
  <TabNavLink href="/atlas/settings">Settings</TabNavLink>
</TabNav>

// with your router's link, as pills
<TabNav aria-label="Project" variant="pill" size="sm">
  <TabNavLink as={RouterLink} to="/atlas" current>Overview</TabNavLink>
</TabNav>
```

## When to use

- The sub-pages of a project, a repository, an account or a record, where each is a page people can link to, bookmark and open in a new tab.
- Under a [PageHeader](../../blocks/PageHeader/PageHeader.mdx), for the sections of the thing it names (its `sections` draw a TabNav).

## When not to use

- Panels on the same page that people switch between without leaving it: use [Tabs](../Tabs/README.md) instead.
- The app's main pages: use a [Navbar](../Navbar/README.md) or a [Sidebar](../Sidebar/README.md) instead.
- Jumping to a section further down a long page: use a [TableOfContents](../TableOfContents/README.md) instead.
- Steps people go through in order: use a [Stepper](../Stepper/README.md) instead.

## Anatomy

Drawn from the `Default` story.

1. **Link list** (`.dk-tabs__list`): the links, in one row that scrolls when they don't fit.
2. **Link** (`.dk-tabs__tab`): goes to its page; the current one has the line (or fill) under it.
3. **Icon** (`.dk-tabs__icon`): an optional picture beside the link's name.

## Usage

- Mark exactly one link `current`: the page people are on. Where a sub-page has pages of its own (Settings, then Billing), keep its link current on them too.
- Keep labels to a word or two, as with Tabs. When the links don't fit, the row scrolls sideways, the edge with more links fades out, and the current one is scrolled into view.
- Use the same `variant` and `size` as any Tabs on the same screen, so the two read as one family. TabNav takes Tabs' look and tokens: restyling Tabs restyles it too.
- `as` renders your router's link, and `configure({ link })` sets it once for the app, as for Link.

### Do and don't

- **Do:** Mark the page people are on with the tab line, so they can see where they are at a glance. (`DoTabLine`)
- **Don't:** Show sub-pages as a row of plain links, where only a bolder weight marks the current one. (`DontPlainLinks`)

## Accessibility

- **Role and name:** a `nav` landmark holding a list of links. Give it an `aria-label` that names the thing ("Project"), since a page often has more than one `nav`. The current link has `aria-current="page"`, which screen readers say as "current page".
- **Keyboard:** each link is a Tab stop, and Enter follows it. There are no arrow keys and no tab roles, because those promise panels on this page, which isn't what happens.
- **Contrast:** link labels keep 4.5:1, and the current line and pill 3:1 against `surface`, in all six themes, as on Tabs (`TabNav.test.tsx`). The focus ring sits inside the link, so the scrolling row can't clip it.
- **What's still yours:** the `aria-label`, and setting `current` on the right link for the page that's showing.

## Props

### TabNav

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the `<nav>`. |
| `variant` | `'line'` \| `'pill'` | `'line'` | A line under the current page's link, or its link filled in `primary` |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 32px, 36px or 44px links; `lg` has 16px text, as on Tabs |

`className`, `ref` and other props go to the `<nav>`. It has `data-component="tab-nav"` and `data-variant`.

### TabNavLink

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `current` | boolean | `false` | This is the page people are on: `aria-current="page"`, drawn as the selected tab |
| `icon` | string \| element | | An icon before the label: an icon name or any element |
| `as` | element type | `configure({ link })`, else `'a'` | Your router's link component; it gets the rest of the props |

`href`, `className`, `ref` and other props go to the link, which sits in an `<li>`. It has `data-state="active"` or `"inactive"`.

## Component tokens

TabNav has no tokens of its own. It's drawn with Tabs' classes, so [Tabs' tokens](../Tabs/README.md#component-tokens) (`--tabs-height-md`, `--tabs-indicator`, `--tabs-text` and the rest) style it too.
