import { useState } from "react";
// Component names and props below are assumed from common design-system conventions.
// I couldn't inspect serupa-ds in this session, so check them against its docs.
import {
  Card,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "serupa-ds";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(false);
  const currentPlan = "Free";

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
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDisplayName(e.target.value)
              }
              placeholder="Your name"
            />
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <Label htmlFor="email-updates">Email updates</Label>
            <Switch
              id="email-updates"
              checked={emailUpdates}
              onCheckedChange={setEmailUpdates}
            />
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <h2>Current plan</h2>
            <p>{currentPlan}</p>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
