import * as z from "zod";

export const SignupFormSchema = z.object({
	email: z.string().email("Please enter a valid email.").trim(),
	password: z
		.string()
		.min(8, "Be at least 8 characters long")
		.regex(/[a-zA-Z]/, "Contain at least one letter.")
		.regex(/[0-9]/, "Contain at least one number.")
		.regex(/[^a-zA-Z0-9]/, "Contain at least one special character.")
		.trim(),
    confirmPassword: z.string().trim(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
});

export const LoginFormSchema = z.object({
    email: z.string().email("Please enter a valid email.").trim(),
    password: z.string().trim(),
});

export type FormState =
	| {
			errors?: {
				name?: string[];
				email?: string[];
				password?: string[];
			};
			message?: string;
	  }
	| undefined;
