import { getCurrentUser } from "@/lib/session";
import { createUserIfMissing } from "@/lib/airtable";

export async function POST() {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await createUserIfMissing({
      email: sessionUser.email,
      name: sessionUser.name,
      googleId: sessionUser.googleId,
    });

    return Response.json({
      success: true,
      userRecordId: user.id,
      fields: user.fields,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
