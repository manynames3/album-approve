import { LockKeyhole } from "lucide-react";
import { unlockProofAction } from "@/app/actions/proof";
import { ProofViewer } from "@/components/proof/proof-viewer";
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
import { hasProofAccess } from "@/server/proof-access";
import { getProofByToken } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function ProofPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    client?: string;
    email?: string;
    submitted?: string;
    error?: string;
  }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const accessGranted = await hasProofAccess(token);
  const proof = await getProofByToken(token, undefined, accessGranted);

  if (!proof) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-white text-zinc-950">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">ProofAlbum</p>
              <p className="text-sm text-zinc-400">Secure album proof</p>
            </div>
          </div>
          <Card className="bg-white text-zinc-950">
            <CardHeader>
              <CardTitle>Enter proof password</CardTitle>
              <CardDescription>
                This link is either password protected, expired, or unavailable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {query.error ? (
                <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  Password was not accepted.
                </p>
              ) : null}
              <form action={unlockProofAction} className="space-y-4">
                <input type="hidden" name="token" value={token} />
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoFocus
                  />
                </div>
                <Button className="w-full">Open proof</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <ProofViewer
      proof={proof}
      token={token}
      defaultName={query.client || proof.client.name}
      defaultEmail={query.email || proof.client.email}
      submitted={query.submitted}
    />
  );
}
