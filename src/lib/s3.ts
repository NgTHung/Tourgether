import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";

export const s3Client = new S3Client({
	endpoint: `https://${env.S3_ENDPOINT}`,
	region: "us-west-002",
	credentials: {
		accessKeyId: env.S3_KEY_ID,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY,
	},
	forcePathStyle: true, // Required for most S3-compatible services
});

