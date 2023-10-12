"use server";

import { authOptions } from "@/auth/auth-options";
import { newClient } from "@/prisma/client";
import { createHash } from "crypto";
import { writeFileSync } from "fs";
import { getServerSession } from "next-auth";
import getConfig from "next/config";
import { z } from "zod";
import { newValidationError } from "./validation-error";

const formDataSchema = z.object({
  url: z.string().min(1, "入力してください"),
  title: z.string().min(1, "入力してください"),
  keywords: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type ValidationError = {
  url?: string[];
  title?: string[];
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
    if (result.data.imageUrl) {
      const matches = result.data.imageUrl.match(
        /^data:(?<contentType>[^;]+);base64,(?<base64>.+)$/,
      );

      const { base64, contentType } = (matches?.groups ?? {}) as {
        base64?: string;
        contentType?: string;
      };

      if (base64 && contentType) {
        const filename = createHash("md5").update(base64).digest("hex");

        const ext = ((): string => {
          if (contentType === "image/jpeg") {
            return ".jpg";
          }

          if (contentType === "image/png") {
            return ".png";
          }

          return "";
        })();

        result.data.imageUrl = `/video/image/${filename}${ext}`;

        writeFileSync(
          `${getConfig().serverRuntimeConfig.PROJECT_ROOT}/public${
            result.data.imageUrl
          }`,
          Buffer.from(base64, "base64"),
        );
      } else {
        result.data.imageUrl = undefined;
      }
    }

    newClient({ shared: true }).$transaction(async (tx) => {
      const video = await tx.video.create({
        data: {
          url: result.data.url,
          title: result.data.title,
          imageUrl: result.data.imageUrl,
          keywords: {
            create: result.data.keywords
              ?.split(",")
              .sort()
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
    console.error({ err });

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
