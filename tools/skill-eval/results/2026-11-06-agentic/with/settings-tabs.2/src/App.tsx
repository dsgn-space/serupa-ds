import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, Container, Field, Heading, Input, SegmentedControl, SkipLink, Stack, Switch, Tab, TabList, TabPanel, Tabs, Text, Toaster, toast } from 'serupa-ds';
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
  const [name, setName] = useState('');
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
                <CardHeader title="General" headingLevel={2} description="How your name appears to others." />
                <CardBody>
                  <form onSubmit={(e) => { e.preventDefault(); toast('Display name saved'); }}>
                    <Stack gap={4}>
                      <Field label="Display name">
                        <Input autoComplete="nickname" value={name} onChange={(e) => setName(e.target.value)} />
                      </Field>
                      <Button type="submit" className="self-start">Save changes</Button>
                    </Stack>
                  </form>
                </CardBody>
              </Card>
            </TabPanel>
            <TabPanel value="notifications" className="pt-6">
              <Card>
                <CardHeader title="Notifications" headingLevel={2} description="Choose what we send you." />
                <CardBody>
                  <Switch
                    checked={emailUpdates}
                    onCheckedChange={(on) => { setEmailUpdates(on); toast(on ? 'Email updates turned on' : 'Email updates turned off'); }}
                    description="Product news and account activity, sent to your email."
                  >
                    Email updates
                  </Switch>
                </CardBody>
              </Card>
            </TabPanel>
            <TabPanel value="billing" className="pt-6">
              <Card>
                <CardHeader title="Billing" headingLevel={2} description="Your current plan." />
                <CardBody>
                  <Stack direction="row" gap={2} align="center">
                    <Text weight="semibold">Free plan</Text>
                    <Badge tone="success">Current</Badge>
                  </Stack>
                </CardBody>
              </Card>
            </TabPanel>
          </Tabs>
        </Stack>
      </Container>
      <Toaster />
    </>
  );
}
