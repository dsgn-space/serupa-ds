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

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast('Saved');
  };

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
            <form onSubmit={handleSave} className="pt-4">
              <Stack gap={4}>
                <Heading level={2}>General</Heading>
                <Field label="Display name" hint="Shown to other people on your team.">
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
          </Tabs.Panel>

          <Tabs.Panel value="notifications">
            <Stack gap={4} className="pt-4">
              <Heading level={2}>Notifications</Heading>
              <Switch
                checked={emailUpdates}
                onChange={(e) => {
                  setEmailUpdates(e.target.checked);
                  toast(e.target.checked ? 'Email updates turned on' : 'Email updates turned off');
                }}
              >
                Email updates
              </Switch>
              <Text className="text-text-muted">
                Get an email when something changes in your projects.
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="billing">
            <Stack gap={4} className="pt-4">
              <Heading level={2}>Billing</Heading>
              <Card className="p-4">
                <Stack gap={2}>
                  <Text className="text-text-muted">Current plan</Text>
                  <Stack direction="row" gap={2} align="center">
                    <Heading level={3}>Pro</Heading>
                    <Badge>Active</Badge>
                  </Stack>
                  <Text className="text-text-muted">$12 per seat, billed monthly.</Text>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
