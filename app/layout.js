import "./globals.css";

export const metadata = {
  title: "Event Membership",
  description: "Google SSO, Airtable, and PayPal/Venmo membership app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
