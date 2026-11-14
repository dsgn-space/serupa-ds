// The theme playground (docs/foundations/ThemePlayground.mdx): pick each theme axis and see components side by side, with the
// attributes to copy. Every axis is an attribute that works on a section as well as on <html>, so the preview is a
// section of this page and the toolbar's own theme stays as it is around it.
// sb-unstyled keeps the docs page's own text styles (colors, sizes) off the components.
import * as React from 'react';
import { Alert } from '../src/components/Alert/Alert';
import { Badge } from '../src/components/Badge/Badge';
import { Button } from '../src/components/Button/Button';
import { Card, CardBody, CardFooter, CardHeader } from '../src/components/Card/Card';
import { Checkbox } from '../src/components/Checkbox/Checkbox';
import { CopyButton } from '../src/components/CopyButton/CopyButton';
import { Field } from '../src/components/Field/Field';
import { Input } from '../src/components/Input/Input';
import { Progress } from '../src/components/Progress/Progress';
import { SegmentedControl } from '../src/components/SegmentedControl/SegmentedControl';
import { Select } from '../src/components/Select/Select';
import { Switch } from '../src/components/Switch/Switch';
import { Tab, TabList, TabPanel, Tabs } from '../src/components/Tabs/Tabs';

type Axis = { key: string; attr: string; label: string; options: Array<{ value: string; label: string }>; initial: string; omit?: string };

// The first option of each is what a page gets with the attribute left off (omit), so it isn't written out.
export const AXES: Axis[] = [
  { key: 'brand', attr: 'data-brand', label: 'Brand', initial: 'blue', options: [{ value: 'blue', label: 'Blue' }, { value: 'violet', label: 'Violet' }, { value: 'emerald', label: 'Emerald' }] },
  { key: 'mode', attr: 'data-mode', label: 'Mode', initial: 'light', options: [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'auto', label: 'Follow the system' }] },
  { key: 'contrast', attr: 'data-contrast', label: 'Contrast', initial: '', omit: '', options: [{ value: '', label: 'Normal' }, { value: 'more', label: 'More contrast' }] },
  { key: 'density', attr: 'data-density', label: 'Density', initial: '', omit: '', options: [{ value: '', label: 'Default' }, { value: 'compact', label: 'Compact' }] },
  { key: 'radius', attr: 'data-radius', label: 'Roundness', initial: '', omit: '', options: [{ value: 'sharp', label: 'Sharp' }, { value: '', label: 'Default' }, { value: 'round', label: 'Round' }] },
  { key: 'shadow', attr: 'data-shadow', label: 'Shadows', initial: '', omit: '', options: [{ value: '', label: 'Neutral' }, { value: 'brand', label: 'Tinted with the brand' }] },
  { key: 'type', attr: 'data-type-scale', label: 'Type scale', initial: '', omit: '', options: [{ value: '', label: 'Fixed' }, { value: 'fluid', label: 'Fluid headings' }] },
];

/** The attributes for a choice of axes, as they'd go on <html>: the ones left at their default are left out. */
export function attributesOf(values: Record<string, string>): Array<[string, string]> {
  return AXES.filter((a) => values[a.key] !== a.omit && values[a.key] != null).map((a) => [a.attr, values[a.key] ?? '']);
}

export function ThemePlayground() {
  const [values, setValues] = React.useState<Record<string, string>>(() => Object.fromEntries(AXES.map((a) => [a.key, a.initial])));
  const attrs = attributesOf(values);
  const html = `<html ${attrs.map(([k, v]) => `${k}="${v}"`).join(' ')}>`;
  return (
    <div className="sb-unstyled flex flex-col gap-6" data-playground>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))' }}>
        {AXES.map((a) => (
          <Field key={a.key} label={a.label}>
            <Select
              value={values[a.key]}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { const v = e.target.value; setValues((s) => ({ ...s, [a.key]: v })); }}
              options={a.options}
            />
          </Field>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <code className="type-code" data-playground-attributes>{html}</code>
        <CopyButton value={html}>Copy the attributes</CopyButton>
      </div>
      <section aria-label="Preview" {...Object.fromEntries(attrs)} className="border border-border p-6 bg-surface text-text" style={{ borderRadius: 'var(--radius-container)' }}>
        <Gallery />
      </section>
    </div>
  );
}

function Gallery() {
  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))' }}>
      <div className="flex flex-col gap-4">
        <p className="type-heading-3">Create a project</p>
        <Field label="Project name" hint="You can change it later."><Input defaultValue="Northwind" /></Field>
        <Field label="Visibility"><SegmentedControl defaultValue="team" options={[{ value: 'me', label: 'Only me' }, { value: 'team', label: 'Team' }, { value: 'all', label: 'Everyone' }]} /></Field>
        <Checkbox defaultChecked>Send me a weekly summary</Checkbox>
        <Switch>Archive finished tasks</Switch>
        <div className="flex gap-2 flex-wrap">
          <Button>Create project</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Help</Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader headingLevel={2} title="Storage" description="Your team's files across every project." />
          <CardBody>
            <Progress value={72} label="72 of 100 GB used" />
          </CardBody>
          <CardFooter><Button size="sm" variant="secondary">Manage storage</Button></CardFooter>
        </Card>
        <Alert tone="warning">Your storage is almost full.</Alert>
        <div className="flex gap-2 flex-wrap">
          <Badge>Draft</Badge>
          <Badge tone="success">Active</Badge>
          <Badge tone="warning">Due soon</Badge>
          <Badge tone="danger">Overdue</Badge>
        </div>
        <Tabs defaultValue="overview">
          <TabList aria-label="Project">
            <Tab value="overview">Overview</Tab>
            <Tab value="activity">Activity</Tab>
            <Tab value="members">Members</Tab>
          </TabList>
          <TabPanel value="overview">Three tasks are due this week.</TabPanel>
          <TabPanel value="activity">Ada closed two tasks.</TabPanel>
          <TabPanel value="members">Five people work on this project.</TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
