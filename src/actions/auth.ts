"use server";
import { redirect } from "next/navigation";
import {
	BusinessSignupFormSchema,
	LoginFormSchema,
	StudentSignupFormSchema,
	type FormState,
} from "~/lib/definitions";
import { auth } from "~/auth";
import type { TRPCError } from "@trpc/server";
import z from "zod/v4";

export async function studentSignup(
	state: unknown,
	formData: FormData,
): Promise<FormState> {
	const fullname = formData.get("fullName") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const confirmPassword = formData.get("confirmPassword") as string;
	const username = formData.get("username") as string;
	const gender = formData.get("gender") as string;
	const phonePrefix = formData.get("phonePrefix") as string;
	const phone = formData.get("phone") as string;
	const phonenumber = phonePrefix && phone ? `${phonePrefix}${phone}` : "";

	const validatedFields = StudentSignupFormSchema.safeParse({
		fullname,
		email,
		password,
		confirmPassword,
		phonenumber,
		username,
		gender,
	});

	const data = {
		fullname,
		email,
		username,
		gender,
		phonePrefix,
		phone,
	};

	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			data,
		};
	}
	try{
		
		await auth.api.signUpEmail({
			body: {
				name: validatedFields.data.fullname,
				email: validatedFields.data.email,
				password: validatedFields.data.password,
				phonenumber: validatedFields.data.phonenumber,
				username: validatedFields.data.username,
				gender: validatedFields.data.gender,
			},
		});
	}
	catch(err: TRPCError | any){
		return {
			message: err.message,
			data
		}
	}
	const callbackUrl = formData.get("callbackUrl") as string;
	redirect(
		callbackUrl
		? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}&onboarding=student`
		: "/signin?onboarding=student",
	);
}

export async function businessSignup(
	state: unknown,
	formData: FormData,
): Promise<FormState> {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const confirmPassword = formData.get("confirmPassword") as string;
	const organizationName = formData.get("organizationName") as string;
	const username = formData.get("username") as string;
	const hotlinePrefix = formData.get("hotlinePrefix") as string;
	const hotline = formData.get("hotline") as string;
	const phonenumber =
		hotlinePrefix && hotline ? `${hotlinePrefix}${hotline}` : "";

	const validatedFields = BusinessSignupFormSchema.safeParse({
		email,
		password,
		confirmPassword,
		phonenumber,
		organizationName,
		username,
	});

	const data = {
		email,
		organizationName,
		username,
		hotlinePrefix,
		hotline,
	};

	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
			data,
		};
	}
	try{
		await auth.api.signUpEmail({
			body: {
				email: validatedFields.data.email,
				password: validatedFields.data.password,
				phonenumber: validatedFields.data.phonenumber,
				name: validatedFields.data.organizationName,
				username: validatedFields.data.username,
				role: "ORGANIZATION",
			},
		});
	}
	catch(err: TRPCError | any){
		return {
			message: err.message,
			data
		}
	}
	const callbackUrl = formData.get("callbackUrl") as string;
	redirect(
		callbackUrl
			? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}&onboarding=business`
			: "/signin?onboarding=business",
	);
}

export async function login(
	state: unknown,
	formData: FormData,
): Promise<FormState> {
	const validatedFields = LoginFormSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
	});
	if (!validatedFields.success) {
		return {
			errors: z.flattenError(validatedFields.error).fieldErrors,
		};
	}
	try{
		const res = await auth.api.signInEmail({
			body: {
				email: validatedFields.data.email,
				password: validatedFields.data.password,
				rememberMe: true,
			},
		});
	}
	catch(err: TRPCError | any){
		return {
			message: err.message,
			data: { email: validatedFields.data.email, password: ""}
		}
	}
	const callbackUrl = (formData.get("callbackUrl") as string) || "/";
	redirect(callbackUrl);
}
