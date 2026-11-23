// Builds assets/core/fonts.css from the @font-face rules shipped with @fontsource,
// keeping only the weights and subsets listed in data/fonts.js. The font files
// themselves are copied to assets/core/fonts/ by the core eleventy plugin.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Absolute path of one font file inside its @fontsource package. */
export const fontFile = (pkg, file) => require.resolve(`@fontsource/${pkg}/files/${file}`);

/** Every font file that gets published, as [file name, absolute source path]. */
export function fontFiles(fonts) {
  return fonts.flatMap(({ pkg, weights, subsets }) =>
    subsets.flatMap((subset) =>
      weights.map((weight) => {
        const file = `${pkg}-${subset}-${weight}-normal.woff2`;
        return [file, fontFile(pkg, file)];
      }),
    ),
  );
}

export function fontsCss(fonts) {
  const rules = [];
  for (const { pkg, weights, subsets } of fonts) {
    for (const weight of weights) {
      const css = readFileSync(require.resolve(`@fontsource/${pkg}/${weight}.css`), "utf8");
      for (const [, name, rule] of css.matchAll(/\/\* (\S+) \*\/\s*(@font-face \{[^}]*\})/g)) {
        const subset = name.slice(pkg.length + 1, -`-${weight}-normal`.length);
        if (!subsets.includes(subset)) continue;
        // woff2 only (every current browser), path relative to this stylesheet
        rules.push(rule.replace(/src: [^;]*;/, `src: url(fonts/${name}.woff2) format("woff2");`));
      }
    }
  }
  return rules.join("\n\n") + "\n";
}
