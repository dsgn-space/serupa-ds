import { useState } from 'react';
import {
  Badge,
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
  Button,
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

          <TabPanel value="general">
            <Card className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast('Saved');
                }}
              >
                <Stack gap={4}>
                  <Heading level={2}>General</Heading>
                  <Field label="Display name" hint="Shown to other people in your workspace.">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoComplete="nickname"
                    />
                  </Field>
                  <div>
                    <Button type="submit">Save changes</Button>
                  </div>
                </Stack>
              </form>
            </Card>
          </TabPanel>

          <TabPanel value="notifications">
            <Card className="p-6">
              <Stack gap={4}>
                <Heading level={2}>Notifications</Heading>
                <Field
                  label="Email updates"
                  hint="Get product news and account activity by email."
                >
                  <Switch
                    checked={emailUpdates}
                    onChange={(e) => {
                      setEmailUpdates(e.target.checked);
                      toast(e.target.checked ? 'Email updates on' : 'Email updates off');
                    }}
                  />
                </Field>
              </Stack>
            </Card>
          </TabPanel>

          <TabPanel value="billing">
            <Card className="p-6">
              <Stack gap={3}>
                <Heading level={2}>Billing</Heading>
                <Stack direction="row" gap={2} align="center">
                  <Text>Current plan:</Text>
                  <Badge>Pro</Badge>
                </Stack>
                <Text className="text-text-muted">
                  Your plan renews monthly. Contact support to change it.
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
