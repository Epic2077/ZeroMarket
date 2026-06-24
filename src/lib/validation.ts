import { z } from "zod";

// Reusable field schemas with Persian messages, shared across the app's forms.
// Keep form-specific shapes co-located with their form; put only the common,
// reused pieces here.

/** A trimmed, non-empty string with a custom "required" message. */
export const requiredText = (message: string) =>
  z.string().trim().min(1, message);

/** A valid email address. */
export const emailField = z.email("یک ایمیل معتبر وارد کنید");

/** A password of at least 8 characters. */
export const passwordField = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد");

/** An optional URL — accepts an empty string or a valid URL. */
export const optionalUrl = z
  .union([z.literal(""), z.url("نشانی اینترنتی نامعتبر است")])
  .optional();
