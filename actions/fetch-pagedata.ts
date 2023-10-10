"use server";

import { authOptions } from "@/auth/auth-options";
import { JSDOM } from "jsdom";
import { getServerSession } from "next-auth";
import { URL } from "url";
import { z } from "zod";
import { newValidationError } from "./validation-error";

const formDataSchema = z.object({
  url: z.string().min(1, "入力してください"),
});

export type ValidationError = {
  url?: string[];
};

export async function fetchPagedata(formData: FormData): Promise<{
  validationError?: ValidationError;
  title?: string;
  description?: string;
  keywords?: string[];
  imageUrls?: string[];
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

  const response = await fetch(result.data.url);

  const responseData = await response.text();

  const dom = new JSDOM(responseData);

  const title = dom.window.document.title;
  const description = dom.window.document.querySelector(
    `meta[name="description"]`,
  )?.textContent;

  const imgs = dom.window.document.querySelectorAll("img");

  const url = new URL(result.data.url);

  console.log(
    dom.window.document.querySelector(".tagsWrapper > div")?.textContent,
  );

  return {
    title: dom.window.document.title,
    description:
      dom.window.document
        .querySelector(`meta[name="description"]`)
        ?.getAttribute("content") ?? undefined,
    keywords: ((): string[] | undefined => {
      let keywords = [
        ...(dom.window.document
          .querySelector(`meta[name="keywords"]`)
          ?.getAttribute("content")
          ?.split(",")
          .map((keyword) => keyword.trim())
          .filter((keyword) => keyword !== "") ?? []),
        ...(Array.from(dom.window.document.querySelectorAll(".tagsWrapper a"))
          .map((elem) => elem.textContent?.trim() ?? "")
          .filter((keyword) => keyword !== "") ?? []),
      ];

      if (keywords.length > 0) {
        return keywords;
      }

      return undefined;
    })(),
    imageUrls: Array.from(imgs).map((img) => {
      if (img.src.startsWith("//")) {
        return url.protocol + img.src;
      }

      if (img.src.startsWith("/")) {
        return url.origin + img.src;
      }

      return img.src;
    }),
  };
}
