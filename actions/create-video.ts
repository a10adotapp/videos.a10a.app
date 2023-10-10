"use server";

import { authOptions } from "@/auth/auth-options";
import { newClient } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { newValidationError } from "./validation-error";

const formDataSchema = z.object({
  title: z.string().min(1, "入力してください"),
  description: z.string().optional(),
  keywords: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type ValidationError = {
  title?: string[];
  description?: string[];
  keywords?: string[];
  imageUrl?: string[];
};

export async function createVideo(formData: FormData): Promise<{
  validationError?: ValidationError;
  errorMessage?: string;
}> {
  const session = await getServerSession(authOptions);

  const result = formDataSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!result.success) {
    return {
      validationError: newValidationError<ValidationError>(result.error),
    };
  }

  try {
    newClient({ shared: true }).$transaction(async (tx) => {
      const video = await tx.video.create({
        data: {
          title: result.data.title,
          description: result.data.description,
          imageUrl: result.data.imageUrl,
          keywords: {
            create: result.data.keywords
              ?.split(",")
              .map((keyword) => keyword.trim())
              .filter(async (keyword) => {
                const record = await tx.keyword.findFirst({
                  where: {
                    keyword: keyword,
                  },
                });

                return !record;
              })
              .map((keyword) => ({
                keyword: keyword,
              })),
          },
        },
      });
    });
  } catch (err) {
    return {
      errorMessage: ((): string => {
        if (err instanceof Error) {
          return err.message;
        }

        return `${err}`;
      })(),
    };
  }

  return {};
}
