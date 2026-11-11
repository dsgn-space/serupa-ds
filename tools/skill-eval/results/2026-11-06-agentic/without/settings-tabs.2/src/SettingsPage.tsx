import { useState } from 'react';
import { Badge, Button, Card, Field, Heading, Input, Stack, Switch, Tab, TabList, TabPanel, Tabs, Text, toast } from 'serupa-ds';

function GeneralTab() {
  const [displayName, setDisplayName] = useState('');
  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast('Display name saved');
        }}
      >
        <Stack gap={4}>
          <Field label="Display name" hint="Shown to other people in your workspace.">
            <Input autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </Field>
          <Button type="submit" className="self-start">Save changes</Button>
        </Stack>
      </form>
    </Card>
  );
}

function NotificationsTab() {
  const [emailUpdates, setEmailUpdates] = useState(true);
  return (
    <Card>
      <Switch
        checked={emailUpdates}
        onCheckedChange={(checked) => {
          setEmailUpdates(checked);
          toast(checked ? 'Email updates turned on' : 'Email updates turned off');
        }}
        description="Get product news and account activity in your inbox."
      >
        Email updates
      </Switch>
    </Card>
  );
}

function BillingTab() {
  return (
    <Card>
      <Stack gap={2}>
        <Heading level={2}>Current plan</Heading>
        <div className="flex items-center gap-2">
          <Text weight="semibold">Free</Text>
          <Badge tone="success">Active</Badge>
        </div>
      </Stack>
    </Card>
  );
}

export function SettingsPage() {
  return (
    <Stack gap={6}>
      <Heading level={1}>Settings</Heading>
      <Tabs defaultValue="general">
        <TabList aria-label="Settings sections">
          <Tab value="general">General</Tab>
          <Tab value="notifications">Notifications</Tab>
          <Tab value="billing">Billing</Tab>
        </TabList>
        <TabPanel value="general" className="pt-4"><GeneralTab /></TabPanel>
        <TabPanel value="notifications" className="pt-4"><NotificationsTab /></TabPanel>
        <TabPanel value="billing" className="pt-4"><BillingTab /></TabPanel>
      </Tabs>
    </Stack>
  );
}
