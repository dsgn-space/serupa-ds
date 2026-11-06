// NOTE: I couldn't inspect the installed serupa-ds package in this session
// (no file or shell access). The component names and props below are assumed
// from common design-system conventions. Check them against the package's
// exports and adjust if they differ.
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "serupa-ds";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(true);

  const plan = { name: "Pro", price: "$12 / month", renews: "Dec 1, 2026" };

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1>Settings</h1>

      <Tabs defaultValue="general">
        <TabsList aria-label="Settings sections">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Save displayName here
              }}
            >
              <Field label="Display name" htmlFor="display-name">
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </Field>
              <Button type="submit">Save changes</Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <label
              htmlFor="email-updates"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <span>
                <strong>Email updates</strong>
                <br />
                Receive product news and account activity by email.
              </span>
              <Switch
                id="email-updates"
                checked={emailUpdates}
                onCheckedChange={setEmailUpdates}
              />
            </label>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <h2>
              Current plan <Badge>{plan.name}</Badge>
            </h2>
            <p>{plan.price}</p>
            <p>Renews on {plan.renews}</p>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
