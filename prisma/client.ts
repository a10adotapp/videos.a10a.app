import { PrismaClient } from "@/prisma/client/index";

var sharedClient: PrismaClient;

export function newClient(args?: { shared: true }): PrismaClient {
  const client = new PrismaClient();

  if (args?.shared) {
    if (!sharedClient) {
      sharedClient = client;
    }

    return sharedClient;
  }

  return client;
}
