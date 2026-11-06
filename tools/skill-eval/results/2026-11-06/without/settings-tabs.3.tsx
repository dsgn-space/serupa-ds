// NOTE: I couldn't inspect the installed serupa-ds package in this session, so the
// component names and props below are assumed. Check them against its exports.
import { useState } from "react";
import {
  Card,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TextField,
  Switch,
  Badge,
  Button,
} from "serupa-ds";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(false);

  const plan = { name: "Pro", price: "$12 / month", renews: "December 1, 2026" };

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1>Settings</h1>

      <Tabs defaultValue="general">
        <TabList aria-label="Settings sections">
          <Tab value="general">General</Tab>
          <Tab value="notifications">Notifications</Tab>
          <Tab value="billing">Billing</Tab>
        </TabList>

        <TabPanel value="general">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Save displayName here
            }}
          >
            <TextField
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              autoComplete="nickname"
            />
            <Button type="submit">Save changes</Button>
          </form>
        </TabPanel>

        <TabPanel value="notifications">
          <Switch
            checked={emailUpdates}
            onCheckedChange={setEmailUpdates}
            label="Email updates"
            description="Receive product news and account updates by email."
          />
        </TabPanel>

        <TabPanel value="billing">
          <Card>
            <h2>Current plan</h2>
            <p>
              {plan.name} <Badge>Active</Badge>
            </p>
            <p>{plan.price}</p>
            <p>Renews on {plan.renews}</p>
          </Card>
        </TabPanel>
      </Tabs>
    </main>
  );
}
