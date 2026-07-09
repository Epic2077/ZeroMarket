import { z } from "zod";
import { emailField, passwordField, requiredText } from "../validation";

// ── Login ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: requiredText("رمز عبور الزامی است"),
});

export type LoginValues = z.infer<typeof loginSchema>;

// ── Signup ──────────────────────────────────────────────────────────────────

export const signupSchema = z
  .object({
    name: requiredText("نام کامل الزامی است"),
    email: emailField,
    phone: z.string().trim().optional(),
    city: requiredText("شهر را انتخاب کنید"),
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

export type SignupValues = z.infer<typeof signupSchema>;
