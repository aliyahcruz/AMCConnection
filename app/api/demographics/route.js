import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createUserIfMissing, createDemographicsRecord } from "@/lib/airtable";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const form = await req.json();

    const user = await createUserIfMissing({
      email: session.user.email,
      name: session.user.name,
      googleId: session.user.email,
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
