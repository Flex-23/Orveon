import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // كود Prisma المولّد تلقائياً — لا يُراجَع ولا يُلَنت (يُعاد توليده دائماً).
    "lib/generated/**",
    // مخرجات تغليف النشر (scripts/package-deploy.mjs) — نسخ مجمّعة، ليست مصدراً.
    "deploy-package/**",
    "scripts/.sharp-linux/**",
  ]),
  // ملف إقلاع Passenger — يجب أن يبقى CommonJS بـ require (انظر DEPLOY.md القسم 5).
  {
    files: ["server.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // احترام تقليد البادئة "_" للوسائط/المتغيّرات المقصود عدم استخدامها (دوال الـ stub مثلاً).
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;
