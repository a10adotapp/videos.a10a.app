import { z } from "zod";

export function newValidationError<ValidationError>(
  zodError: z.ZodError,
): ValidationError {
  return zodError.errors.reduce<{
    [key in string]: string[];
  }>((result, issue: z.ZodIssue) => {
    for (const key of issue.path) {
      if (!(key in result)) {
        result[key] = [];
      }

      result[key].push(issue.message);
    }

    return result;
  }, {}) as ValidationError;
}
