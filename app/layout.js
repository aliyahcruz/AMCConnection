import Providers from "./providers";
import "./styles.css";

export const metadata = {
  title: "Event Membership",
  description: "Membership signup, payment, demographics, and event preferences",
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
