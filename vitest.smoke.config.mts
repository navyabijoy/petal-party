import { defineConfig } from "vitest/config";

// Network tests against the real Supabase project. Run on demand: npx vitest run --config vitest.smoke.config.mts
export default defineConfig({ test: { include: ["scripts/*.smoke.test.ts"], testTimeout: 90_000 } });
