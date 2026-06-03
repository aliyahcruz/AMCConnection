export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!appUrl || !clientId) {
    return Response.json(
      { error: "Missing NEXT_PUBLIC_APP_URL or GOOGLE_CLIENT_ID." },
      { status: 500 }
    );
  }

  const redirectUri = `${appUrl}/api/auth/google-callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
