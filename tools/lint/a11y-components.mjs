// What each Serupa component renders, for eslint-plugin-jsx-a11y-x's settings (eslint.config.mjs), so its rules
// read <Image> as an img, <Link> as an a and <Checkbox> as an input. Read from the components in
// src/components/: one whose ref is a React.RefAttributes<HTMLAnchorElement> (named('Link', …)) renders an a. A new component is covered with no edit
// here. Components on a plain div or span, or a section of a table, are left out: the plugin learns nothing from them.
import fs from 'node:fs';
import path from 'node:path';

const TAGS = {
  Anchor: 'a', Button: 'button', Data: 'data', Dialog: 'dialog', Image: 'img', Input: 'input', LI: 'li', OList: 'ol',
  Select: 'select', Table: 'table', TableCell: 'td', TableRow: 'tr', TextArea: 'textarea', Time: 'time', UList: 'ul',
};
// Where the element type doesn't say: Button is typed HTMLElement because it renders a button, or an a when given
// href (a control either way), and a table cell's type is the same for td and th.
const BY_NAME = { Button: 'button', TableHeaderCell: 'th' };
// Rendered as an a, but with its own href and words, so <SkipLink /> is complete: read as an a, jsx-a11y would ask an
// app for both (anchor-has-content, anchor-is-valid). ChatCitation writes its own words too (its number and host), and
// TableColumnsMenu's button its own "Columns" (labels.tableColumns, or label).
const COMPLETE = ['SkipLink', 'ChatCitation', 'TableColumnsMenu'];
// Rendered as an a only sometimes, so read as one they flag what's right: BreadcrumbItem is text for the current page,
// with or without href (anchor-is-valid on PageHeader's trail), and a ListItem's click lands on the link it renders
// when given href, not on the li (click-events-have-key-events on ListDetail's list). Left out, as plain components.
const SOMETIMES = ['BreadcrumbItem', 'ListItem'];

export function a11yComponents(root) {
  const dir = path.join(root, 'src', 'components');
  const map = {};
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name, name + '.tsx');
    if (!fs.existsSync(file)) continue;
    // Each component is function XRender({ ref, … }: … & React.RefAttributes<HTMLAnchorElement>), named as 'Link' by
    // named('Link', XRender). The first element of a union (HTMLButtonElement | HTMLAnchorElement for IconButton) is the
    // one it renders by default; a local alias (type IconButtonElement = HTMLButtonElement | …) is read through.
    const src = fs.readFileSync(file, 'utf8');
    const renders = {};
    for (const m of src.matchAll(/^function (\w+)\([^\n]*?React\.RefAttributes<((?:\w+ \| )*?\w+)\b[^>]*>\)/gm)) {
      const first = m[2].split(' | ')[0];
      const alias = new RegExp(`type ${first} = HTML(\\w+)Element`).exec(src);
      const tag = /^HTML(\w+)Element$/.exec(first)?.[1] ?? alias?.[1];
      if (tag && TAGS[tag]) renders[m[1]] = TAGS[tag];
    }
    for (const m of src.matchAll(/named\(\s*["'](\w+)["'],\s*(\w+)\)/g)) if (renders[m[2]]) map[m[1]] = renders[m[2]];
  }
  for (const name of [...COMPLETE, ...SOMETIMES]) delete map[name];
  return { ...map, ...BY_NAME };
}
