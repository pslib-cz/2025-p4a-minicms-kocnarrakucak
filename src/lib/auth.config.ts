import type { NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const authConfig = {
  secret: authSecret,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
