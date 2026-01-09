/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { env } from "process";
import "./src/env.ts";

/** @type {import("next").NextConfig} */
const config: import("next").NextConfig = {};

module.exports = {
  images: {
    remotePatterns: [new URL("https://" + env.S3_ENDPOINT + "/**")],
  },
}

export default config;
