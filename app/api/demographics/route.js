import { getCurrentUser } from "@/lib/session";
import { createUserIfMissing, createDemographicsRecord } from "@/lib/airtable";

export async function POST(req) {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const form = await req.json();

    const user = await createUserIfMissing({
      email: sessionUser.email,
      name: sessionUser.name,
      googleId: sessionUser.googleId,
    });

    await createDemographicsRecord({
      userRecordId: user.id,
      form,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
