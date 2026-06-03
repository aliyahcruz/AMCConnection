import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "Event Membership",
  description: "Membership signup with Google SSO, PayPal/Venmo, and Airtable",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
