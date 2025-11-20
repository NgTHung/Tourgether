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
			},
		}),
        usernameClient(),
	],
});

export type Session = typeof authClient.$Infer.Session;
