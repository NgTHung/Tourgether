import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";

export const s3Client = new S3Client({
  region: env.S3_REGION_CODE,
  endpoint: env.S3_ENDPOINT, // IDrive e2 custom endpoint
  credentials: {
    accessKeyId: env.S3_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for S3-compatible services like IDrive e2
});
