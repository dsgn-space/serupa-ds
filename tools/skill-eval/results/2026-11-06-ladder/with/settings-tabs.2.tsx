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
  VisuallyHidden,
  toast,
} from 'serupa-ds';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [emailUpdates, setEmailUpdates] = useState(true);

  return (
    <>
      <VisuallyHidden focusable as="a" href="#main">
        Skip to content
      </VisuallyHidden>

      <Container as="main" id="main" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Settings</Heading>

          <Tabs defaultValue="general" aria-label="Settings sections">
            <TabList>
              <Tab value="general">General</Tab>
              <Tab value="notifications">Notifications</Tab>
              <Tab value="billing">Billing</Tab>
            </TabList>

            <TabPanel value="general">
              <Card className="p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast('Saved');
                  }}
                >
                  <Stack gap={4}>
                    <Heading level={2} size="lg">
                      General
                    </Heading>
                    <Field
                      label="Display name"
                      hint="This is how your name appears to other people."
                    >
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
              <Card className="p-4">
                <Stack gap={4}>
                  <Heading level={2} size="lg">
                    Notifications
                  </Heading>
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
              <Card className="p-4">
                <Stack gap={3}>
                  <Heading level={2} size="lg">
                    Billing
                  </Heading>
                  <Stack direction="row" gap={2} align="center">
                    <Text>Current plan:</Text>
                    <Text className="font-semibold">Pro</Text>
                    <Badge>Active</Badge>
                  </Stack>
                  <Text className="text-text-muted">
                    $12 per month, renews on the 1st of each month.
                  </Text>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>
        </Stack>
      </Container>

      <Toaster />
    </>
  );
}
