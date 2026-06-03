import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createUserIfMissing, createEventPreferenceRecord } from "@/lib/airtable";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { preference } = await req.json();

    if (!preference) {
      return Response.json({ error: "Missing preference" }, { status: 400 });
    }

    const user = await createUserIfMissing({
      email: session.user.email,
      name: session.user.name,
      googleId: session.user.email,
    });

    await createEventPreferenceRecord({
      userRecordId: user.id,
      preference,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
