// A small piece of product, made of Serupa's components, that the front page and the themes page show: the same
// markup in every theme, so what differs between two of them is only the tokens.
import * as React from 'react';
import { Alert } from '../../src/components/Alert/Alert';
import { Avatar } from '../../src/components/Avatar/Avatar';
import { AvatarGroup } from '../../src/components/AvatarGroup/AvatarGroup';
import { Badge } from '../../src/components/Badge/Badge';
import { Button } from '../../src/components/Button/Button';
import { Card, CardBody, CardFooter, CardHeader } from '../../src/components/Card/Card';
import { Field } from '../../src/components/Field/Field';
import { Input } from '../../src/components/Input/Input';
import { Progress } from '../../src/components/Progress/Progress';
import { SegmentedControl } from '../../src/components/SegmentedControl/SegmentedControl';
import { Switch } from '../../src/components/Switch/Switch';

const TEAM = ['Dewi Lestari', 'Budi Santoso', 'Sari Wijaya', 'Agus Pratama'];

/** A project's card: who is on it, how far along it is, and what state it is in. */
export function ProjectCard({ headingLevel = 3 }: { headingLevel?: 2 | 3 | 4 }) {
  return <Card>
    <CardHeader headingLevel={headingLevel} title="Website refresh" description="Due on 28 November" action={<Badge tone="success" dot>On track</Badge>} />
    <CardBody className="flex flex-col gap-4">
      <Progress value={68} label="Tasks done" showValue />
      <AvatarGroup label="Team" size="lg" max={3} total={7}>{TEAM.map((n) => <Avatar key={n} name={n} />)}</AvatarGroup>
    </CardBody>
  </Card>;
}

/** A short form: a field with a hint, a choice, a switch and the two buttons a form ends with. */
export function InviteCard({ headingLevel = 3 }: { headingLevel?: 2 | 3 | 4 }) {
  return <Card>
    <CardHeader headingLevel={headingLevel} title="Invite a teammate" />
    <CardBody className="flex flex-col gap-4">
      <Field label="Work email" hint="We’ll send them a link to join."><Input type="email" defaultValue="sari@northwind.example" autoComplete="off" /></Field>
      <Field label="Role"><SegmentedControl defaultValue="editor" fullWidth options={[{ value: 'viewer', label: 'Viewer' }, { value: 'editor', label: 'Editor' }, { value: 'admin', label: 'Admin' }]} /></Field>
      <Switch defaultChecked>Email them a weekly summary</Switch>
    </CardBody>
    <CardFooter className="flex flex-wrap gap-2 justify-end">
      <Button variant="secondary">Cancel</Button>
      <Button>Send invite</Button>
    </CardFooter>
  </Card>;
}

/** The statuses side by side: each tone with its word, and a message in the same voice. */
export function StatusCard() {
  return <div className="flex flex-col gap-4">
    <div className="flex flex-wrap gap-2">
      <Badge>Draft</Badge>
      <Badge tone="info">In review</Badge>
      <Badge tone="success">Active</Badge>
      <Badge tone="warning">Due soon</Badge>
      <Badge tone="danger">Overdue</Badge>
    </div>
    <Alert tone="info" title="Two invites are waiting">Dewi and Budi haven’t joined yet.</Alert>
  </div>;
}

/** All three, as one theme's panel shows them. */
export function Sample({ headingLevel = 3 }: { headingLevel?: 2 | 3 | 4 }) {
  return <div className="site-sample">
    <ProjectCard headingLevel={headingLevel} />
    <InviteCard headingLevel={headingLevel} />
    <StatusCard />
  </div>;
}
