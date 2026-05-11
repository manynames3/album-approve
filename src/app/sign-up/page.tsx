import Link from "next/link";
import { Album } from "lucide-react";
import { signUpAction } from "@/app/actions/auth";
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

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Album className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Create studio</CardTitle>
          <CardDescription>
            The demo creates a local session and routes you to studio setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signUpAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Avery Stone" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <Button className="w-full">Create account</Button>
          </form>
          <p className="mt-4 text-sm text-zinc-600">
            Already have access?{" "}
            <Link href="/sign-in" className="font-medium text-teal-700">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
