import { getCurrentUser } from "@/lib/session";
import { createUserIfMissing, createEventPreferenceRecord } from "@/lib/airtable";

export async function POST(req) {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { preference } = await req.json();

    if (!preference) {
      return Response.json({ error: "Missing preference" }, { status: 400 });
    }

    const user = await createUserIfMissing({
      email: sessionUser.email,
      name: sessionUser.name,
      googleId: sessionUser.googleId,
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
