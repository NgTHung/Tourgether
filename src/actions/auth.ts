"use server";
import { redirect } from "next/navigation";
import {
	BusinessSignupFormSchema,
	LoginFormSchema,
	StudentSignupFormSchema,
	type FormState,
} from "~/lib/definitions";
import { auth } from "~/auth";
import { ApiError } from "next/dist/server/api-utils";
import { api } from "~/trpc/server";

export async function studentSignup(state: any, formData: FormData): Promise<FormState> {
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
			errors: validatedFields.error.flatten().fieldErrors,
			data,
		};
	}
	try {
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
		await api.guide.createGuideProfile({
			description: "",
			certificates: [],
			school: "",
			workExperience: [],
		});
	} catch (error: ApiError | any) {
		return {
			message: error.message,
			data,
		};
	}
	const callbackUrl = formData.get("callbackUrl") as string;
	redirect(
		callbackUrl
			? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
			: "/signin",
	);
}

export async function businessSignup(state: any, formData: FormData): Promise<FormState> {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const confirmPassword = formData.get("confirmPassword") as string;
	const organizationName = formData.get("organizationName") as string;
	const taxId = formData.get("taxId") as string;
	const website = formData.get("website") as string;
	const username = formData.get("username") as string;
	const hotlinePrefix = formData.get("hotlinePrefix") as string;
	const hotline = formData.get("hotline") as string;
	const phonenumber = hotlinePrefix && hotline ? `${hotlinePrefix}${hotline}` : "";

	const validatedFields = BusinessSignupFormSchema.safeParse({
		email,
		password,
		confirmPassword,
		phonenumber,
		organizationName,
		taxId,
		website,
	});

	const data = {
		email,
		organizationName,
		taxId,
		website,
		username,
		hotlinePrefix,
		hotline,
	};

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			data,
		};
	}
	try {
		const data = await auth.api.signUpEmail({
			body: {
				email: validatedFields.data.email,
				password: validatedFields.data.password,
				phonenumber: validatedFields.data.phonenumber,
				name: validatedFields.data.organizationName,
			},
		});
		await api.organization.createOrganization({
			taxID: parseInt(validatedFields.data.taxId),
			websiteURL: validatedFields.data.website || "",
			slogan: "",
		});
	} catch (error: ApiError | any) {
		return {
			message: error.message,
			data,
		};
	}
	const callbackUrl = formData.get("callbackUrl") as string;
	redirect(
		callbackUrl
			? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
			: "/signin",
	);
}

export async function login(state: any, formData: FormData): Promise<FormState> {
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
	const callbackUrl = (formData.get("callbackUrl") as string) || "/";
	redirect(callbackUrl);
}
