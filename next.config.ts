/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from "next";
import { env } from "~/env";

/** @type {import("next").NextConfig} */
const config: NextConfig = {
    images:{
        remotePatterns:[new URL("https://" + env.S3_ENDPOINT + "/**")]
    },
    serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"]
};

export default config;
