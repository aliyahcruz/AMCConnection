import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPayPalAccessToken } from "@/lib/paypal";
import {
  createUserIfMissing,
  createPaymentRecord,
  updateUserMembership,
} from "@/lib/airtable";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return Response.json({ error: "Missing PayPal orderId" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    const res = await fetch(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: 500 });
    }

    if (data.status === "COMPLETED") {
      const user = await createUserIfMissing({
        email: session.user.email,
        name: session.user.name,
        googleId: session.user.email,
      });

      await createPaymentRecord({
        userRecordId: user.id,
        amount: process.env.MEMBERSHIP_AMOUNT || "25.00",
        orderId,
        status: "Completed",
      });

      await updateUserMembership(user.id);
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
