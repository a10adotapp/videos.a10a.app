import { sharedClient } from "@/prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions, DefaultSession } from "next-auth";
import { newGoogleProvider } from "./google";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(sharedClient),
  providers: [newGoogleProvider()],
  callbacks: {
    session: async ({ session, user }) => {
      if (user.id) {
        session.user.id = user.id;
      }

      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
