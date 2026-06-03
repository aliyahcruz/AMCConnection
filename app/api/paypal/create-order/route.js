import { getCurrentUser } from "@/lib/session";
import { getPayPalAccessToken } from "@/lib/paypal";

export async function POST() {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const accessToken = await getPayPalAccessToken();
    const amount = process.env.MEMBERSHIP_AMOUNT || "25.00";

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
            description: "Event App Membership",
            custom_id: sessionUser.email,
            amount: {
              currency_code: "USD",
              value: amount,
            },
          },
        ],
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
