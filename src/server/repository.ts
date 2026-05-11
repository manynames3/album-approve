import "server-only";
import { getSupabaseAdmin } from "@/server/supabase";

export type RepositoryMode = "local-demo" | "supabase-ready";

export function repositoryMode(): RepositoryMode {
  return getSupabaseAdmin() ? "supabase-ready" : "local-demo";
}

export async function assertSupabaseSchemaReady() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      ready: false,
      mode: "local-demo" as RepositoryMode,
      message:
        "Supabase env vars are missing. The app is using the local demo store.",
    };
  }

  const { error } = await supabase.from("studios").select("id").limit(1);

  return {
    ready: !error,
    mode: "supabase-ready" as RepositoryMode,
    message: error
      ? `Supabase connection exists but schema check failed: ${error.message}`
      : "Supabase schema is reachable.",
  };
}
