import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Accordion, AccordionItem, Alert, Avatar, AvatarGroup, Badge, Breadcrumb, BreadcrumbItem, Button, ButtonGroup, Card, CardBody,
  CardFooter, CardHeader, Checkbox, Divider, EmptyState, Field, Heading, IconButton, Input, Kbd, Link, List, ListItem, Meter,
  Pagination, Progress, Radio, RadioGroup, Rating, SearchInput, SegmentedControl, Select, Slider, Stepper, Switch, Tab, Table,
  TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableSelectCell, TabList, TabPanel, Tabs, Text, Textarea, Timeline,
  TimelineItem,
} from '../../index';

// Kitchen sink (132): most components together on one page, at rest, as an app would put them. The visual tests shoot
// it in each of the six themes (and with the other axes: right to left, more contrast, compact), so a token change
// shows where it meets every component at once, and the a11y checks run axe on the whole page in each theme. Pick a
// theme in the toolbar to see it.
const meta = {
  title: 'Guides/Kitchen sink',
  parameters: { layout: 'padded' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const people = [
  { id: 1, name: 'Ada Lovelace', role: 'Admin', calls: 128 },
  { id: 2, name: 'Grace Hopper', role: 'Editor', calls: 96 },
  { id: 3, name: 'Alan Turing', role: 'Viewer', calls: 41 },
];

function Sink() {
  const [picked, setPicked] = React.useState(new Set([2]));
  const toggle = (id: number) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  return <div className="flex flex-col gap-8" style={{ maxInlineSize: 1040 }}>
    <div className="flex flex-col gap-3">
      <Breadcrumb>
        <BreadcrumbItem href="#" icon="home">Home</BreadcrumbItem>
        <BreadcrumbItem href="#">Projects</BreadcrumbItem>
        <BreadcrumbItem>Atlas</BreadcrumbItem>
      </Breadcrumb>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Heading level={1}>Atlas</Heading>
          <Text tone="muted">Website redesign, due 30 November. <Link href="#">Project brief</Link></Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AvatarGroup label="Members" max={3}>
            <Avatar name="Ada Lovelace" /><Avatar name="Grace Hopper" /><Avatar name="Alan Turing" /><Avatar name="Katherine Johnson" />
          </AvatarGroup>
          <ButtonGroup aria-label="Share">
            <Button variant="outline" leftIcon="link">Copy link</Button>
            <IconButton variant="outline" icon="more_horiz" label="More actions" />
          </ButtonGroup>
          <Button leftIcon="add">New task</Button>
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <Alert tone="info" title="Review on Friday">The client sees the new home page at 10:00.</Alert>
      <Alert tone="success">Changes saved.</Alert>
      <Alert tone="warning" title="Storage almost full">Atlas uses 92% of its space.</Alert>
      <Alert tone="danger" title="Payment failed" actions={<Button size="sm" variant="secondary">Update card</Button>}>We couldn't charge the card ending 4242.</Alert>
    </div>

    <Tabs defaultValue="tasks">
      <TabList aria-label="Atlas">
        <Tab value="tasks">Tasks</Tab>
        <Tab value="activity" icon="history">Activity</Tab>
        <Tab value="settings" disabled>Settings</Tab>
      </TabList>
      <TabPanel value="tasks">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput aria-label="Search tasks" defaultValue="home page" />
            <SegmentedControl aria-label="Period" defaultValue="week" options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />
            <Badge>Draft</Badge>
            <Badge tone="success" dot>Online</Badge>
            <Badge variant="solid" tone="primary">New</Badge>
            <Badge variant="outline" tone="info">Beta</Badge>
            <Badge tone="warning" leftIcon="schedule">Pending</Badge>
          </div>
          <Table caption="Team members">
            <TableHead>
              <TableRow>
                <TableSelectCell header label="Select all rows" checked={picked.size === people.length} indeterminate={picked.size > 0 && picked.size < people.length}
                  onChange={() => setPicked(picked.size === people.length ? new Set() : new Set(people.map((p) => p.id)))} />
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell align="end">Calls</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {people.map((p) => <TableRow key={p.id} selected={picked.has(p.id)}>
                <TableSelectCell label={`Select ${p.name}`} checked={picked.has(p.id)} onChange={() => toggle(p.id)} />
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.role}</TableCell>
                <TableCell align="end">{p.calls}</TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
          <Pagination count={12} defaultPage={3} total={118} pageSize={10} />
        </div>
      </TabPanel>
      <TabPanel value="activity">Nothing yet.</TabPanel>
      <TabPanel value="settings">Settings.</TabPanel>
    </Tabs>

    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      <Card>
        <CardHeader title="Project details" description="Shown to everyone in the project." action={<Badge tone="success">Active</Badge>} />
        <CardBody>
          <div className="flex flex-col gap-4">
            <Field label="Name" hint="Up to 40 characters." required><Input defaultValue="Atlas" /></Field>
            <Field label="Owner"><Select options={['Ada Lovelace', 'Grace Hopper', 'Alan Turing']} defaultValue="Grace Hopper" /></Field>
            <Field label="Summary" optional><Textarea rows={2} defaultValue="A new site for the spring launch." /></Field>
            <Field label="Budget code" error="Use six digits, like 104233."><Input defaultValue="10423" /></Field>
          </div>
        </CardBody>
        <CardFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader title="Preferences" />
        <CardBody>
          <div className="flex flex-col gap-4">
            <Field group label="Notify me about">
              <Checkbox name="notify" value="comments" defaultChecked>Comments</Checkbox>
              <Checkbox name="notify" value="mentions" description="When someone writes your name.">Mentions</Checkbox>
            </Field>
            <Field group label="Plan">
              <RadioGroup name="plan" defaultValue="pro">
                <Radio value="free">Free</Radio>
                <Radio value="pro" description="Unlimited projects and history.">Pro</Radio>
              </RadioGroup>
            </Field>
            <Switch defaultChecked description="Pause notifications from 10 pm to 7 am.">Quiet hours</Switch>
            <Field label="Volume"><Slider defaultValue={60} /></Field>
            <Field label="How was the review?"><Rating defaultValue={4} /></Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Progress" />
        <CardBody>
          <div className="flex flex-col gap-4">
            <Stepper current={1} steps={[{ title: 'Brief' }, { title: 'Design' }, { title: 'Build' }, { title: 'Launch' }]} />
            <Progress value={45} label="Uploading mockups.zip" showValue />
            <Meter value={92} low={80} high={95} optimum={0} label="Storage" showValue />
            <Divider />
            <Timeline aria-label="Recent activity">
              <TimelineItem title="Design approved" time="12 Mar, 09:14" status="success" icon="check" />
              <TimelineItem title="Comment from Ada" time="12 Mar, 10:02" status="primary">Can the header be shorter?</TimelineItem>
            </Timeline>
          </div>
        </CardBody>
      </Card>
    </div>

    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      <List variant="card" aria-label="Files">
        <ListItem leading="description" title="Brief.pdf" description="2 MB" trailing="Yesterday" />
        <ListItem leading="image" title="Home page.png" description="840 KB" trailing={<Badge tone="info">Review</Badge>} />
        <ListItem leading={<Avatar name="Grace Hopper" alt="" size="sm" />} title="Grace Hopper" description="grace@example.com" />
      </List>
      <Accordion defaultValue={['shipping']}>
        <AccordionItem value="shipping" title="Who can see this project?">Everyone in the Atlas team, and the client from Friday.</AccordionItem>
        <AccordionItem value="returns" title="How do I invite someone?">Choose Copy link, or press <Kbd keys={['Ctrl', 'I']} />.</AccordionItem>
      </Accordion>
      <EmptyState size="sm" icon="folder_open" title="No archived tasks" description="Tasks you archive show up here." actions={<Button variant="outline">View all tasks</Button>} />
    </div>
  </div>;
}

/** Most components at rest on one page. Pick a theme, contrast or density in the toolbar. */
export const Default: Story = { render: () => <Sink /> };
