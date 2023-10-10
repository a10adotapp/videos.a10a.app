import Google from "next-auth/providers/google";

export function newGoogleProvider() {
  return Google({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "no google auth client id",
    clientSecret:
      process.env.GOOGLE_OAUTH_CLIENT_SECRET || "no google auth client secret",
  });
}
