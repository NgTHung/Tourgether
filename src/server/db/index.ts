import { drizzle } from "drizzle-orm/node-postgres";
import * as tour from "./schema/tour";
import * as user from "./schema/auth-schema";
import * as socialMedia from "./schema/social-media";

export const db = drizzle({
	connection: {
		connectionString: process.env.DATABASE_URL!,
		ssl: true,
	},
	schema: {
		...tour,
		...user,
		...socialMedia,
	},
});
