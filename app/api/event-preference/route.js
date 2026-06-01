import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAirtableRecord } from "@/lib/airtable";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { preference } = await req.json();

    await createAirtableRecord("Event Preferences", {
      Email: session.user.email,
      Preference: preference,
      "Created At": new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
