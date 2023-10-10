import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { AuthOptions, DefaultSession } from "next-auth";
import { newGoogleProvider } from "./google";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
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
