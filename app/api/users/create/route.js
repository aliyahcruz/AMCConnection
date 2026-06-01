import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { upsertUserByEmail } from "@/lib/airtable";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await upsertUserByEmail({
      Email: session.user.email,
      Name: session.user.name || "",
      "Payment Status": "Pending",
      "Membership Active": false,
      "Created At": new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
