import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }

      if (user && account) {
        if (token.role !== "ADMIN" && account.providerAccountId === process.env.DEFAULT_ADMIN_ID) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
          token.role = "ADMIN";
        }
      }

      if (trigger === "update") {
        const updatedUsername =
          typeof session?.username === "string"
            ? session.username
            : typeof session?.user?.username === "string"
              ? session.user.username
              : undefined;

        if (updatedUsername) {
          token.username = updatedUsername;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }

        session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";

        if (typeof token.username === "string") {
          session.user.username = token.username;
        }
      }
      return session;
    },
  },
});
