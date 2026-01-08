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
});

export const StudentSignupFormSchema = SignupFormSchema.extend({
	fullname: z.string().min(1, "Full name is required.").trim(),
	phonenumber: z.string().min(1, "Phone number is required.").trim(),
	// address: z.string().min(1, "Address is required.").trim(),
	gender: z.enum(["male", "female", "other"]),
	username: z.string().min(1, "Username is required.").trim(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match.",
});

export const BusinessSignupFormSchema = SignupFormSchema.extend({
	phonenumber: z.string().min(1, "Phone number is required.").trim(),
	// address: z.string().min(1, "Address is required.").trim(),
	organizationName: z
		.string()
		.min(1, "Organization name is required.")
		.trim(),
	username: z.string().min(1, "Username is required.").trim(),
	website: z.string().url("Please enter a valid URL.").optional(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match.",
});

export const LoginFormSchema = z.object({
	email: z.email("Please enter a valid email.").trim(),
	password: z.string().trim(),
});

export type StudentData = {
	fullname?: string;
	email?: string;
	username?: string;
	gender?: string;
	phonePrefix?: string;
	phone?: string;
};

export type LoginData = {
	email?: string;
	password?: string;
};

export type OrganizationData = {
	email?: string;
	organizationName?: string;
	username?: string;
	hotlinePrefix?: string;
	hotline?: string;
};

export type FormState =
	| {
			errors?: {
				name?: string[];
				email?: string[];
				password?: string[];
				confirmPassword?: string[];
				phonenumber?: string[];
				username?: string[];
				organizationName?: string[];
				taxId?: string[];
				website?: string[];
				fullname?: string[];
				gender?: string[];
			};
			message?: string;
			data?: StudentData | LoginData | OrganizationData;
	  }
	| undefined;
