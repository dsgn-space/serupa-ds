import { useState } from 'react';
import {
  Alert,
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
  announce,
  toast,
} from 'serupa-ds';

export function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [nameError, setNameError] = useState<string | null>(null);

  function saveGeneral(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) {
      setNameError('Enter a display name, for example "Alex Rivera".');
      return;
    }
    setNameError(null);
    toast('Display name saved');
  }

  function changeEmailUpdates(checked: boolean) {
    setEmailUpdates(checked);
    announce(checked ? 'Email updates turned on' : 'Email updates turned off');
  }

  return (
    <>
      <VisuallyHidden focusable>
        <a href="#settings-main">Skip to content</a>
      </VisuallyHidden>

      <Container as="main" id="settings-main">
        <Stack gap={6} className="py-8">
          <Heading level={1}>Settings</Heading>

          <Tabs defaultValue="general">
            <TabList aria-label="Settings sections">
              <Tab value="general">General</Tab>
              <Tab value="notifications">Notifications</Tab>
              <Tab value="billing">Billing</Tab>
            </TabList>

            <TabPanel value="general">
              <Card className="p-4">
                <form onSubmit={saveGeneral} noValidate>
                  <Stack gap={4}>
                    <Heading level={2}>General</Heading>
                    <Field
                      label="Display name"
                      hint="Other people see this name on your activity."
                      error={nameError ?? undefined}
                    >
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        invalid={nameError !== null}
                        autoComplete="name"
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
                  <Heading level={2}>Notifications</Heading>
                  <Field
                    label="Email updates"
                    hint="Get product news and activity summaries by email. Changes apply right away."
                  >
                    <Switch
                      checked={emailUpdates}
                      onChange={(e) => changeEmailUpdates(e.target.checked)}
                    />
                  </Field>
                </Stack>
              </Card>
            </TabPanel>

            <TabPanel value="billing">
              <Card className="p-4">
                <Stack gap={4}>
                  <Heading level={2}>Billing</Heading>
                  <Stack direction="row" gap={2} align="center">
                    <Text>Current plan: Pro</Text>
                    <Badge>Active</Badge>
                  </Stack>
                  <Text className="text-text-muted">
                    Your plan renews on the 1st of each month.
                  </Text>
                  <Alert>To change your plan, contact your workspace admin.</Alert>
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

export default SettingsPage;
