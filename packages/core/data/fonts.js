// Self-hosted fonts from the @fontsource packages (all OFL-1.1).
// Only these weights and character subsets are published; the browser downloads
// a file only when the page uses characters from its unicode-range.
export default [
  // Body text (400, 700), headings and card ranks (800)
  { pkg: "manrope", weights: [400, 700, 800], subsets: ["latin", "latin-ext"] },
];
