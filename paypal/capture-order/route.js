import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPayPalAccessToken } from "@/lib/paypal";
import { upsertUserByEmail } from "@/lib/airtable";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return Response.json({ error: "Missing orderId" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    const res = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: res.status });
    }

    if (data.status === "COMPLETED") {
      await upsertUserByEmail({
        Email: session.user.email,
        Name: session.user.name || "",
        "Payment Status": "Paid",
        "PayPal Order ID": orderId,
        "Membership Active": true,
      });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
