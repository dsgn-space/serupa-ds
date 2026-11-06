// NOTE: I couldn't inspect the installed serupa-ds package in this session,
// so the component names and props below are assumed (shadcn-style API).
// Check them against the package's exports before using.
import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Label,
  Switch,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "serupa-ds";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(true);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Persist displayName here
  };

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
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave}>
                <Label htmlFor="display-name">Display name</Label>
                <Input
                  id="display-name"
                  name="displayName"
                  value={displayName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDisplayName(e.target.value)
                  }
                  placeholder="Your name"
                  autoComplete="nickname"
                />
                <Button type="submit">Save changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Switch
                  id="email-updates"
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates}
                />
                <Label htmlFor="email-updates">Email updates</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Current plan: <Badge>Pro</Badge>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
