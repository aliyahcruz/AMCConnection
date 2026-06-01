import GoogleProvider from "next-auth/providers/google";
import { upsertUserByEmail } from "@/lib/airtable";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user?.email) return false;

      try {
        await upsertUserByEmail({
          Email: user.email,
          Name: user.name || "",
          "Google ID": profile?.sub || account?.providerAccountId || "",
          "Payment Status": "Pending",
          "Membership Active": false,
          "Created At": new Date().toISOString(),
        });
      } catch (error) {
        console.error("Airtable user upsert failed:", error);
      }

      return true;
    },
  },
};
