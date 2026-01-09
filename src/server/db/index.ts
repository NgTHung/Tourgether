import { drizzle } from "drizzle-orm/node-postgres";
import * as tour from "./schema/tour";
import * as user from "./schema/auth-schema";
import * as socialMedia from "./schema/social-media";
import { env } from "~/env";

export const db = drizzle({
	connection: {
		connectionString: env.DATABASE_URL,
		ssl: true,
	},
	schema: {
		...tour,
		...user,
		...socialMedia,
	},
});
