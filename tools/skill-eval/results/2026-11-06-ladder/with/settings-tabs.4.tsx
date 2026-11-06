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
  Tabs,
  Text,
  VisuallyHidden,
  toast,
} from 'serupa-ds';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <>
      <VisuallyHidden focusable>
        <a href="#main">Skip to content</a>
      </VisuallyHidden>

      <Container as="main" id="main" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Settings</Heading>

          <Tabs
            defaultValue="general"
            items={[
              {
                value: 'general',
                label: 'General',
                content: (
                  <Card className="p-4">
                    <Stack gap={4}>
                      <Heading level={2} size="md">
                        General
                      </Heading>
                      <Field label="Display name" hint="Shown to other people in your workspace.">
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          onBlur={() => displayName && toast('Saved')}
                          autoComplete="name"
                        />
                      </Field>
                    </Stack>
                  </Card>
                ),
              },
              {
                value: 'notifications',
                label: 'Notifications',
                content: (
                  <Card className="p-4">
                    <Stack gap={4}>
                      <Heading level={2} size="md">
                        Notifications
                      </Heading>
                      <Switch
                        label="Email updates"
                        checked={emailUpdates}
                        onChange={(e) => {
                          setEmailUpdates(e.target.checked);
                          toast(e.target.checked ? 'Email updates on' : 'Email updates off');
                        }}
                      />
                      <Text className="text-text-muted">
                        Get product news and account activity by email.
                      </Text>
                    </Stack>
                  </Card>
                ),
              },
              {
                value: 'billing',
                label: 'Billing',
                content: (
                  <Card className="p-4">
                    <Stack gap={4}>
                      <Heading level={2} size="md">
                        Billing
                      </Heading>
                      <Stack direction="row" gap={2} align="center">
                        <Text>Current plan:</Text>
                        <Badge>Pro</Badge>
                      </Stack>
                      <Text className="text-text-muted">$12 per month, billed monthly.</Text>
                    </Stack>
                  </Card>
                ),
              },
            ]}
          />
        </Stack>
      </Container>
    </>
  );
}
