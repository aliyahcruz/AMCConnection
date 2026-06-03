# Event Membership Site

This is a GitHub-ready Next.js app using:

- Google SSO with NextAuth
- Airtable for Users, Payments, Demographics, and Event Preferences
- PayPal Checkout with Venmo enabled
- Vercel-ready environment variables

## 1. Install

```bash
npm install
```

## 2. Environment variables

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

Then fill in your values.

## 3. Airtable tables

### Users

Primary field: `Email`

Fields:

- Email — Email
- Name — Single line text
- Google ID — Single line text
- Membership Active — Checkbox
- Membership Expiration Date — Date
- Role — Single select: User, Admin
- Created At — Created time

### Payments

Primary field: `Payment ID`

Fields:

- Payment ID — Formula: `"PAY-" & RECORD_ID()`
- User — Link to Users
- Amount — Currency
- Status — Single select: Pending, Completed, Failed, Refunded
- PayPal Order ID — Single line text
- Payment Date — Created time

### Demographics

Primary field: `Demographic ID`

Fields:

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

Primary field: `Preference ID`

Fields:

- Preference ID — Formula: `{User Email} & " - " & {Preference Type}`
- User — Link to Users
- User Email — Lookup from Users > Email
- Preference Type — Single select: Date, Event Type, Both
- Created At — Created time

## 4. Google redirect URI

In Google Cloud Console, add:

```text
http://localhost:3000/api/auth/callback/google
https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/callback/google
```

## 5. Vercel environment variables

Add all variables from `.env.example` in Vercel Project Settings.

For production PayPal, change:

```env
PAYPAL_BASE_URL=https://api-m.paypal.com
```

## 6. Run locally

```bash
npm run dev
```

## Notes

- Airtable linked records require Airtable record IDs, not email text.
- Payments are stored in the `Payments` table.
- Users only store identity and membership status.
- Venmo display is controlled by PayPal eligibility and may not appear for every user/device.
