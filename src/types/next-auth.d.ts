import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      username?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "USER" | "ADMIN";
    username: string;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: "USER" | "ADMIN";
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN";
    username?: string;
  }
}
