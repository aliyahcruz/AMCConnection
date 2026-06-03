import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();

  return Response.json({
    authenticated: Boolean(user),
    user,
  });
}
