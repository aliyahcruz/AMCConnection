# Event Membership Site

Complete corrected Next.js project for:

- Google SSO via NextAuth
- Airtable Users, Payments, Demographics, and Event Preferences
- PayPal Checkout with Venmo enabled
- Vercel deployment

## Install

```bash
npm install
npm run dev
```

## Required Vercel environment variables

```env
NEXTAUTH_URL=https://YOUR-VERCEL-APP.vercel.app
NEXTAUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=

NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

MEMBERSHIP_AMOUNT=25.00
MEMBERSHIP_LENGTH_DAYS=365
```

For production PayPal:

```env
PAYPAL_BASE_URL=https://api-m.paypal.com
```

## Google OAuth redirect URIs

Add both in Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
https://YOUR-VERCEL-APP.vercel.app/api/auth/callback/google
```

## Airtable tables

### Users

Primary field: Email

- Email — Email
- Name — Single line text
- Google ID — Single line text
- Membership Active — Checkbox
- Membership Expiration Date — Date
- Role — Single select: User, Admin
- Created At — Created time

### Payments

Primary field: Payment ID

- Payment ID — Formula: `"PAY-" & RECORD_ID()`
- User — Link to Users
- Amount — Currency
- Status — Single select: Pending, Completed, Failed, Refunded
- PayPal Order ID — Single line text
- Payment Date — Created time

### Demographics

Primary field: Demographic ID

- Demographic ID — Formula: `{User Email} & " Demographics"`
- User — Link to Users
- User Email — Lookup from Users > Email
- First Name — Single line text
- Last Name — Single line text
- Date of Birth — Date
- Age — Number
- Gender — Single select
- City — Single line text
- State — Single line text
- Zip Code — Single line text
- Phone Number — Phone number
- Created At — Created time

### Event Preferences

Primary field: Preference ID

- Preference ID — Formula: `{User Email} & " - " & {Preference Type}`
- User — Link to Users
- User Email — Lookup from Users > Email
- Preference Type — Single select: Date, Event Type, Both
- Created At — Created time

## Important

This project includes `jsconfig.json`, so imports like `@/lib/airtable` resolve correctly.
