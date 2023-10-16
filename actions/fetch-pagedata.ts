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
  errorMessage?: string;
  title?: string;
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

  if (!response.ok) {
    const contentType = response.headers.get("Content-Type");

    if (contentType) {
      if (new RegExp(/text\/html/, "i").test(contentType)) {
        const dom = new JSDOM(responseData);

        return {
          errorMessage: `Status: ${response.status}\n${dom.window.document.title}`,
        };
      }
    }

    return {
      errorMessage: `Status: ${response.status}\n${responseData}`,
    };
  }

  const dom = new JSDOM(responseData);

  const url = new URL(result.data.url);

  return {
    title: dom.window.document.title,
    keywords: await newKeywords(dom),
    imageUrls: await newImageUrls(dom, url),
  };
}

async function newKeywords(dom: JSDOM): Promise<string[] | undefined> {
  let keywords = [
    ...(dom.window.document
      .querySelector(`meta[name="keywords"]`)
      ?.getAttribute("content")
      ?.split(/[,、]/)
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword !== "") ?? []),
    ...(Array.from(dom.window.document.querySelectorAll(".tagsWrapper a"))
      .map((elem) => elem.textContent?.trim() ?? "")
      .filter((keyword) => keyword !== "") ?? []),
  ];

  if (keywords.length > 0) {
    return [...new Set(keywords)].sort();
  }

  return undefined;
}

async function newImageUrls(dom: JSDOM, baseUrl: URL): Promise<string[]> {
  const imgs = dom.window.document.querySelectorAll("img");

  let imageUrls = [
    dom.window.document
      .querySelector(`meta[property="og:image"]`)
      ?.getAttribute("content") ?? "",
    dom.window.document
      .querySelector(`meta[property="twitter:image"]`)
      ?.getAttribute("content") ?? "",
    ...Array.from(imgs).map((img) => {
      if (img.src.startsWith("//")) {
        return baseUrl.protocol + img.src;
      }

      if (img.src.startsWith("/")) {
        return baseUrl.origin + img.src;
      }

      return img.src;
    }),
  ];

  imageUrls = imageUrls.filter((imageUrl) => imageUrl);

  imageUrls = await Promise.all(
    imageUrls.map(async (imageUrl) => {
      try {
        const response = await fetch(imageUrl);

        const contentType = response.headers.get("Content-Type");

        let isContentTypeAcceptable =
          contentType === "image/jpeg" || contentType === "image/png";

        if (!isContentTypeAcceptable) {
          console.info(
            `content type is not acceptable (Content-Type: ${contentType})`,
          );

          return "";
        }

        const responseData = await response.arrayBuffer();

        const base64 = Buffer.from(responseData).toString("base64");

        return `data:${contentType};base64,${base64}`;
      } catch (err) {
        console.error({ err });
      }

      return "";
    }),
  );

  imageUrls = imageUrls.filter((imageUrl) => imageUrl);

  return imageUrls;
}
