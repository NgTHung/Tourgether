/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from "next";
import "./src/env.ts";

/** @type {import("next").NextConfig} */
const config: NextConfig = {
    images:{
        remotePatterns:[new URL("https://s3.us-west-002.backblazeb2.com/**")]
    },
    serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"]
};

export default config;
