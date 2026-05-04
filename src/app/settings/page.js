import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Project-wide settings can be added here next.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-text-secondary">
        The new content system is file-backed and editable today. If you want, the next step can be authentication,
        role permissions, or moving this store to a real database.
      </CardContent>
    </Card>
  );
}
