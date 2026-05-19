/**
 * Runtime environment detection.
 *
 * NEXT_PUBLIC_RUNTIME_ENV is set to "preview" in netlify.toml during
 * Netlify builds.  Locally (npm run dev / npm start) the variable is
 * absent, so IS_HOSTED_PREVIEW is false.
 *
 * This value is baked into the client bundle at build time, so it is
 * safe to use in both Server and Client Components.
 */
export const IS_HOSTED_PREVIEW =
  process.env.NEXT_PUBLIC_RUNTIME_ENV === "preview";
