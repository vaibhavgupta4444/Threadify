import { z } from "zod";

export const signUpSchema = z
  .object({
    username: z.string(),
    email: z.string().email({ message: "Invalid email address" }),
    contactNo: z
      .string()
      .regex(
        /^(?:\+91[6-9]\d{9}|[6-9]\d{9}|\+[1-9]\d{1,14})$/,
        {
          message:
            "Enter a valid mobile number. (e.g., 9876543210, +919876543210, or +14155552671)",
        }
      ),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
