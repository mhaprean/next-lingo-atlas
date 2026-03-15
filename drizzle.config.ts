import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: [".env.local", ".env"],
});

export default defineConfig({
  schema: "./app/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public", "neon_auth"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
