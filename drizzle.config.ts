import "dotenv/config";
import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in the .env file");
}

const databaseUrl = new URL(process.env.DATABASE_URL!);

export default {
    schema: "./db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        host: databaseUrl.hostname,
        port: parseInt(databaseUrl.port || "5432"),
        user: databaseUrl.username,
        password: databaseUrl.password,
        database: databaseUrl.pathname.slice(1),
        ssl: databaseUrl.searchParams.get("sslmode") === "require",
    },
} satisfies Config;

console.log("DATABASE_URL:", process.env.DATABASE_URL);
