import { Palette, Save } from "lucide-react";
import { updateStudioAction } from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/server/auth";
import { getDashboardData } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const { studio } = await getDashboardData(user.id);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Studio settings
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Configure the branding clients see in proofing links and emails.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            These fields are integration-ready for Supabase profile storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateStudioAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Studio name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={studio.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                defaultValue={studio.logoUrl}
                placeholder="https://example.com/logo.png"
                type="url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandColor">Brand color</Label>
              <div className="flex gap-3">
                <Input
                  id="brandColor"
                  name="brandColor"
                  defaultValue={studio.brandColor || "#0f766e"}
                  pattern="^#[0-9a-fA-F]{6}$"
                />
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg border text-white"
                  style={{ backgroundColor: studio.brandColor || "#0f766e" }}
                  aria-label="Current brand color"
                >
                  <Palette className="size-4" aria-hidden="true" />
                </div>
              </div>
            </div>
            <Button className="gap-2">
              <Save className="size-4" aria-hidden="true" />
              Save settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
