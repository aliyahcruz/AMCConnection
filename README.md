# Event Membership Site

A starter Next.js website with:

- Google SSO login using NextAuth
- PayPal Checkout with Venmo enabled
- Airtable storage for users, payment status, demographics, and event preferences

## 1. Install

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your keys.

```bash
cp .env.example .env.local
```

## 3. Airtable setup

Create these Airtable tables exactly as named below.

### Users

Fields:

- Email — Single line text
- Name — Single line text
- Google ID — Single line text
- Payment Status — Single select or Single line text
- PayPal Order ID — Single line text
- Membership Active — Checkbox
- Created At — Date/time

### Demographics

Fields:

- Email — Single line text
- First Name — Single line text
- Last Name — Single line text
- Age — Number or Single line text
- City — Single line text
- State — Single line text
- Created At — Date/time

### Event Preferences

Fields:

- Email — Single line text
- Preference — Single select or Single line text
- Created At — Date/time

## 4. Google OAuth setup

In Google Cloud Console:

1. Create OAuth Client ID.
2. Application type: Web application.
3. Add authorized redirect URI:

Local:

```text
http://localhost:3000/api/auth/callback/google
```

Production example:

```text
https://yourdomain.com/api/auth/callback/google
```

## 5. PayPal/Venmo setup

Use PayPal Developer Dashboard to create a REST app.

For sandbox:

```env
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```

For production:

```env
PAYPAL_BASE_URL=https://api-m.paypal.com
```

Venmo eligibility is controlled by PayPal and may not show for all users or devices.

## 6. Deploy to Vercel

1. Push this folder to GitHub.
2. Import the GitHub repo into Vercel.
3. Add all environment variables in Vercel.
4. Update `NEXTAUTH_URL` to your production domain.
5. Add your production Google callback URL in Google Cloud Console.
