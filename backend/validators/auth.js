import { z } from "zod";

export const SignupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(6).max(200),
});

export const LoginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(200),
});

export const SIGNUP_ERROR = "Enter a name, a valid email, and a 6+ character password.";
export const LOGIN_ERROR = "Enter your email and password.";
