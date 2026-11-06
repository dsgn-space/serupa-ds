// NOTE: I couldn't inspect the installed serupa-ds package in this session, so the
// component names and props below are assumptions. Check them against its exports.
import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Label,
  Switch,
  Card,
  Badge,
  Button,
} from "serupa-ds";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(true);

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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // save displayName here
            }}
            style={{ display: "grid", gap: 12, marginTop: 16 }}
          >
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDisplayName(e.target.value)
              }
              placeholder="Your name"
              autoComplete="name"
            />
            <div>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="notifications">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginTop: 16,
            }}
          >
            <Label htmlFor="email-updates">Email updates</Label>
            <Switch
              id="email-updates"
              checked={emailUpdates}
              onCheckedChange={setEmailUpdates}
            />
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <Card style={{ marginTop: 16, padding: 16 }}>
            <p style={{ margin: 0 }}>Current plan</p>
            <p style={{ margin: "8px 0 0", display: "flex", gap: 8, alignItems: "center" }}>
              <strong>Pro</strong>
              <Badge>Active</Badge>
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
