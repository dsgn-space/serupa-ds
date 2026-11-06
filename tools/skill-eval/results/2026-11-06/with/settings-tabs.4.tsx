import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Container,
  Field,
  Heading,
  Input,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  Toaster,
  toast,
} from 'serupa-ds';

export function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [emailUpdates, setEmailUpdates] = useState(true);

  return (
    <Container as="main" className="py-8">
      <Stack gap={6}>
        <Heading level={1}>Settings</Heading>

        <Tabs defaultValue="general">
          <TabList aria-label="Settings sections">
            <Tab value="general">General</Tab>
            <Tab value="notifications">Notifications</Tab>
            <Tab value="billing">Billing</Tab>
          </TabList>

          <TabPanel value="general" className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast('Saved');
              }}
            >
              <Stack gap={4} className="max-w-md">
                <Field
                  label="Display name"
                  hint="Shown to other people on your team."
                >
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                  />
                </Field>
                <div>
                  <Button type="submit">Save changes</Button>
                </div>
              </Stack>
            </form>
          </TabPanel>

          <TabPanel value="notifications" className="pt-6">
            <Stack gap={4} className="max-w-md">
              <Switch
                label="Email updates"
                checked={emailUpdates}
                onChange={(e) => {
                  setEmailUpdates(e.target.checked);
                  toast(e.target.checked ? 'Email updates on' : 'Email updates off');
                }}
              />
              <Text className="text-text-muted">
                Get product news and account activity in your inbox.
              </Text>
            </Stack>
          </TabPanel>

          <TabPanel value="billing" className="pt-6">
            <Card className="max-w-md p-4">
              <Stack gap={2}>
                <Heading level={2}>Current plan</Heading>
                <Stack direction="row" gap={2} align="center">
                  <Text>Pro</Text>
                  <Badge>Active</Badge>
                </Stack>
                <Text className="text-text-muted">
                  Your plan renews on the first of each month.
                </Text>
              </Stack>
            </Card>
          </TabPanel>
        </Tabs>
      </Stack>
      <Toaster />
    </Container>
  );
}
