"use server";
import {
	LoginFormSchema,
	SignupFormSchema,
	type FormState,
} from "~/lib/definitions";
import { auth } from "~/auth";
import { ApiError } from "next/dist/server/api-utils";
export async function signup(state: FormState, formData: FormData) {
	const validatedFields = SignupFormSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
		confirmPassword: formData.get("confirmPassword"),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}
	try {
		await auth.api.signUpEmail({
			body: {
				name: "",
				email: validatedFields.data.email,
				password: validatedFields.data.password,
			},
		});
	} catch (error: ApiError | any) {
		if (error instanceof ApiError) {
			return {
				message: error.message,
			};
		}
		return {
			message: "An unknown error occurred.",
		};
	}
}

export async function login(state: FormState, formData: FormData) {
	const validatedFields = LoginFormSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
	});
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}
	try {
		await auth.api.signInEmail({
			body: {
				email: validatedFields.data.email,
				password: validatedFields.data.password,
				rememberMe: true,
			},
		});
	} catch (error: ApiError | any) {
		return {
			message: error.message,
		};
	}
}
