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
  Tabs,
  Text,
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
          <Tabs.List aria-label="Settings sections">
            <Tabs.Tab value="general">General</Tabs.Tab>
            <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
            <Tabs.Tab value="billing">Billing</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general">
            <form
              className="pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast('Display name saved');
              }}
            >
              <Stack gap={4}>
                <Field
                  label="Display name"
                  hint="Shown to other people on your team."
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
          </Tabs.Panel>

          <Tabs.Panel value="notifications">
            <div className="pt-4">
              <Switch
                checked={emailUpdates}
                onChange={(e) => {
                  setEmailUpdates(e.target.checked);
                  toast(e.target.checked ? 'Email updates on' : 'Email updates off');
                }}
              >
                Email me product updates
              </Switch>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="billing">
            <div className="pt-4">
              <Card>
                <Stack gap={2}>
                  <Heading level={2}>Current plan</Heading>
                  <Stack direction="row" gap={2} align="center">
                    <Text>Pro</Text>
                    <Badge>Active</Badge>
                  </Stack>
                  <Text className="text-text-muted">
                    $19 per month, billed monthly.
                  </Text>
                </Stack>
              </Card>
            </div>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
