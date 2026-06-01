import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPayPalAccessToken } from "@/lib/paypal";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const price = process.env.MEMBERSHIP_PRICE || "25.00";

    const res = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: session.user.email,
            description: "Event App Membership",
            amount: {
              currency_code: "USD",
              value: price,
            },
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: res.status });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
