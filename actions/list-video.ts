import { sharedClient } from "@/prisma/client";
import { Video } from "@/prisma/client/index";
import { z } from "zod";
import { newValidationError } from "./validation-error";

const formDataSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
});

export type ValidationError = {
  page?: string[];
  perPage?: string[];
};

export async function listVideo(args: {
  page?: number;
  perPage?: number;
}): Promise<{
  videos: Video[];
  currentPage: number;
  totalPage: number;
  validationError?: ValidationError;
  errorMessage?: string;
}> {
  const parseResult = formDataSchema.safeParse(args);

  if (!parseResult.success) {
    return {
      videos: [],
      currentPage: 1,
      totalPage: 0,
      validationError: newValidationError<ValidationError>(parseResult.error),
    };
  }

  const page = parseResult.data.page ?? 1;
  const perPage = parseResult.data.perPage ?? 30;

  try {
    const totalVideoCount = await sharedClient.video.count();

    const videos = await sharedClient.video.findMany({
      skip: perPage * (page - 1),
      take: perPage,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      videos: videos,
      currentPage: page,
      totalPage: Math.ceil(totalVideoCount / perPage),
    };
  } catch (err) {
    console.error({ err });

    return {
      videos: [],
      currentPage: 1,
      totalPage: 0,
      errorMessage: ((): string => {
        if (err instanceof Error) {
          return err.message;
        }

        return `${err}`;
      })(),
    };
  }
}
