import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // firebase-admin must stay external to the server bundle. When Next bundles
  // it, its dynamic requires (@google-cloud/*, google-gax, native deps) can be
  // dropped by the serverless file tracer, so the function crashes at startup —
  // which surfaces to the browser as an empty 500 from /api/auth/username-login.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
