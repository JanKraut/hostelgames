// Web analytics, chosen at build time with environment variables. Without them
// (local builds, tests, GitHub Pages) no tracking code is written at all.
//
//   TRACKING_PROVIDER  gtm | ga4 | matomo   (anything else: off)
//   TRACKING_ID        gtm: container ID, e.g. GTM-XXXXXXX
//                      ga4: measurement ID, e.g. G-XXXXXXXXXX
//                      matomo: site ID, e.g. 1
//   MATOMO_URL         matomo only: address of the Matomo installation, e.g. https://matomo.example.de/
//
// Only IDs and addresses go in here, nothing secret: they end up in every page anyway.

const provider = (process.env.TRACKING_PROVIDER ?? "").trim().toLowerCase();
const id = (process.env.TRACKING_ID ?? "").trim();
let matomoUrl = (process.env.MATOMO_URL ?? "").trim();
if (matomoUrl && !matomoUrl.endsWith("/")) matomoUrl += "/";

const PATTERNS = {
  gtm: /^GTM-[A-Z0-9]+$/,
  ga4: /^G-[A-Z0-9]+$/,
  matomo: /^\d+$/,
};

function config() {
  if (!PATTERNS[provider]) {
    if (provider && provider !== "none") throw new Error(`TRACKING_PROVIDER "${provider}" unknown, use gtm, ga4, matomo or none`);
    return { provider: null };
  }
  if (!PATTERNS[provider].test(id)) throw new Error(`TRACKING_ID "${id}" doesn't look like a ${provider} ID`);
  if (provider === "matomo" && !/^https:\/\/[^\s"'<>]+\/$/.test(matomoUrl)) {
    throw new Error("MATOMO_URL must be set to an https:// address for matomo");
  }
  return { provider, id, matomoUrl };
}

export default config();
