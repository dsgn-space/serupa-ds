import { useEffect, useState } from 'react';
import { Badge, Button, Card, Container, Field, Heading, Input, SegmentedControl, SkipLink, Stack, Switch, Tab, TabList, TabPanel, Tabs, Text, Toaster, toast } from 'serupa-ds';
import type { ThemeMode } from 'serupa-ds';

// theme.js (first in <head>) follows the visitor's light or dark setting and remembers a choice made here.
function ThemeSwitch() {
  const [mode, setMode] = useState<ThemeMode>(() => window.Serupa?.theme?.get().mode ?? 'auto');
  useEffect(() => window.Serupa?.theme?.onChange((info) => setMode(info.mode)), []);
  return (
    <SegmentedControl
      aria-label="Theme"
      value={mode}
      onValueChange={(value) => window.Serupa?.theme?.set({ mode: value as ThemeMode })}
      options={[{ value: 'auto', label: 'Auto' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
    />
  );
}

export function App() {
  const [displayName, setDisplayName] = useState('');
  const [emailUpdates, setEmailUpdates] = useState(false);
  return (
    <>
      <SkipLink />
      <Container as="header" className="flex items-center justify-between gap-4 py-4">
        <Text as="span" weight="semibold">Eval app</Text>
        <ThemeSwitch />
      </Container>
      <Container as="main" id="main" size="prose" className="py-8">
        <Stack gap={6}>
          <Heading level={1}>Settings</Heading>
          <Tabs defaultValue="general">
            <TabList aria-label="Settings sections">
              <Tab value="general">General</Tab>
              <Tab value="notifications">Notifications</Tab>
              <Tab value="billing">Billing</Tab>
            </TabList>
            <TabPanel value="general" className="pt-6">
              <Card>
                <form onSubmit={(e) => { e.preventDefault(); toast('Changes saved'); }}>
                  <Stack gap={4}>
                    <Field label="Display name" hint="Shown to other people in your workspace.">
                      <Input autoComplete="nickname" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </Field>
                    <Button type="submit" className="self-start">Save changes</Button>
                  </Stack>
                </form>
              </Card>
            </TabPanel>
            <TabPanel value="notifications" className="pt-6">
              <Card>
                <Switch
                  checked={emailUpdates}
                  description="Product news and account activity, sent to your email."
                  onCheckedChange={(checked) => { setEmailUpdates(checked); toast(checked ? 'Email updates turned on' : 'Email updates turned off'); }}
                >
                  Email updates
                </Switch>
              </Card>
            </TabPanel>
            <TabPanel value="billing" className="pt-6">
              <Card>
                <Stack gap={2}>
                  <Text tone="muted" size="sm">Current plan</Text>
                  <div className="flex items-center gap-2">
                    <Heading level={2}>Free</Heading>
                    <Badge tone="success">Active</Badge>
                  </div>
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
