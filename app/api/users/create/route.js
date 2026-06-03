import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createUserIfMissing } from "@/lib/airtable";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await createUserIfMissing({
      email: session.user.email,
      name: session.user.name,
      googleId: session.user.email,
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
