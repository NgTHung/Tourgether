import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "~/env";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields({
			user: {
				role: {
					type: "string",
					enum: ["GUIDE", "ORGANIZATION"],
					required: true,
					input: true,
				},
				phonenumber: {
					type: "string",
					required: false,
					input: true,
				},
				address: {
					type: "string",
					required: false,
					input: true,
				},
				gender: {
					type: "string",
					required: false,
					input: true,
				},
				birthday: {
					type: "string",
					required: false,
					input: true,
				},
				verificationID: {
					type: "string",
					required: false,
					input: true,
				},
				rating: {
					type: "number",
					required: false,
					input: false,
				},
				mediapage: {
					type: "string",
					required: false,
					input: false,
				},
				finishedOnboardings: {
					type: "boolean",
					required: false,
					input: false,
				},
			},
		}),
        usernameClient(),
	],
	baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,

});

export type Session = typeof authClient.$Infer.Session;
