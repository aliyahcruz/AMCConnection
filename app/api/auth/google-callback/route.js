import { setSessionCookie } from "@/lib/session";
import { createUserIfMissing } from "@/lib/airtable";

export async function GET(req) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!appUrl || !clientId || !clientSecret) {
      return Response.json(
        { error: "Missing Google OAuth environment variables." },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return Response.redirect(`${appUrl}/?error=missing_google_code`);
    }

    const redirectUri = `${appUrl}/api/auth/google-callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return Response.json(tokenData, { status: 500 });
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      cache: "no-store",
    });

    const profile = await profileRes.json();

    if (!profileRes.ok || !profile.email) {
      return Response.json(profile, { status: 500 });
    }

    await createUserIfMissing({
      email: profile.email,
      name: profile.name,
      googleId: profile.sub,
    });

    await setSessionCookie({
      email: profile.email,
      name: profile.name,
      googleId: profile.sub,
      picture: profile.picture,
    });

    return Response.redirect(appUrl);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
