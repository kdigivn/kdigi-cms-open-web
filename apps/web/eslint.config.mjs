import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  // scripts/** are offline CLI tools (image composer, check:seo) that print to the console by design
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**", "scripts/**"] },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // khoi-system-design: no stray logs in production code; disable per line with a reason
      "no-console": "error",
    },
  },
];

export default config;
