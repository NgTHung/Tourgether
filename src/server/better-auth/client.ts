import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields({
			user: {
				role: {
					type: "string",
					enum: ["ADMIN", "USER", "GUIDE", "ORGANIZATION"],
					required: true,
					input: false,
				},
				phonenumber: {
					type: "string",
					required: true,
					input: true,
				},
				address: {
					type: "string",
					required: true,
					input: true,
				},
				gender: {
					type: "string",
					required: true,
					input: true,
				},
				birthday: {
					type: "string",
					required: true,
					input: true,
				},
				verificationID: {
					type: "string",
					required: true,
					input: true,
				},
				rating: {
					type: "number",
					required: true,
					input: false,
				},
				mediapage: {
					type: "string",
					required: true,
					input: false,
				},
			},
		}),
        usernameClient(),
	],
});

export type Session = typeof authClient.$Infer.Session;
