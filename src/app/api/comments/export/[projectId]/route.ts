import { getCurrentUser } from "@/server/auth";
import { exportProjectCommentsCsv } from "@/server/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { projectId } = await context.params;
  const csv = await exportProjectCommentsCsv(user.id, projectId);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${projectId}-comments.csv"`,
    },
  });
}
