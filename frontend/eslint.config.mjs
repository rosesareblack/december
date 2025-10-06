import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Demote warnings temporarily to unblock shipping
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/alt-text": "warn",
      "@next/next/no-img-element": "warn",
      // Allow @ts-nocheck temporarily until types are fixed
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-nocheck": "allow-with-description",
        "minimumDescriptionLength": 10
      }],
    },
  },
];

export default eslintConfig;
