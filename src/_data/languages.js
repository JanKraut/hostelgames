import { readFileSync } from "node:fs";
import site from "./site.js";

// One entry per published language, in menu order.
// `fallback` is tried in order for every text a language does not define itself;
// English is always the last resort. Example: es-419 only stores what differs from es.
const LANGUAGES = [
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "cs", flag: "🇨🇿", name: "Čeština" },
  { code: "da", flag: "🇩🇰", name: "Dansk" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "es-419", flag: "🌎", name: "Español (Latinoamérica)", fallback: ["es"] },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "it", flag: "🇮🇹", name: "Italiano" },
  { code: "nl", flag: "🇳🇱", name: "Nederlands" },
  { code: "nb", flag: "🇳🇴", name: "Norsk" },
  { code: "pl", flag: "🇵🇱", name: "Polski" },
  { code: "pt", flag: "🇵🇹", name: "Português" },
  { code: "pt-br", flag: "🇧🇷", name: "Português (Brasil)", fallback: ["pt"] },
  { code: "sv", flag: "🇸🇪", name: "Svenska" },
  { code: "he", flag: "🇮🇱", name: "עברית", dir: "rtl" },
];

const DEFAULT = "en";

const load = (code) =>
  JSON.parse(readFileSync(new URL(`./i18n/${code}.json`, import.meta.url), "utf8"));

// Merge English <- fallbacks <- own texts. `quiz` is merged one level deeper.
function texts(lang) {
  const chain = [DEFAULT, ...(lang.fallback ?? []), lang.code].filter(
    (code, i, all) => all.indexOf(code) === i,
  );
  return chain.map(load).reduce((merged, own) => ({
    ...merged,
    ...own,
    quiz: { ...merged.quiz, ...own.quiz },
  }));
}

export default LANGUAGES.map((lang) => {
  const path = lang.code === DEFAULT ? "/" : `/${lang.code}/`;
  return {
    dir: "ltr",
    ...lang,
    // BCP 47 tag for <html lang> and hreflang, e.g. pt-BR
    htmlLang: lang.code.replace(/-([a-z]{2})$/, (_, region) => `-${region.toUpperCase()}`),
    path,
    url: site.origin + site.pathPrefix + path.slice(1),
    t: texts(lang),
  };
});
