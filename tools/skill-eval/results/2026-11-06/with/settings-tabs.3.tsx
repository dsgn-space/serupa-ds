import { useState } from 'react';
import { Badge, Button, Card, Container, Field, Heading, Input, Stack, Switch, Tabs, Text, toast } from 'serupa-ds';

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
            <Card className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast('Saved');
                }}
              >
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
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="notifications">
            <Card className="p-4">
              <Stack gap={4}>
                <Heading level={2}>Notifications</Heading>
                <Switch
                  label="Email updates"
                  checked={emailUpdates}
                  onChange={(e) => {
                    setEmailUpdates(e.target.checked);
                    toast(e.target.checked ? 'Email updates turned on' : 'Email updates turned off');
                  }}
                />
                <Text className="text-text-muted">
                  Get product news and account activity in your inbox.
                </Text>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="billing">
            <Card className="p-4">
              <Stack gap={3}>
                <Heading level={2}>Billing</Heading>
                <Stack direction="row" gap={2} align="center">
                  <Text>Current plan:</Text>
                  <Badge>Pro</Badge>
                </Stack>
                <Text className="text-text-muted">$12 per month, renews on the 1st.</Text>
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
