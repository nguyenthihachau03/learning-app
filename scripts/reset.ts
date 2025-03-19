import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
//hoac cach nay de dung cach import thu vien ben ngoai
//const { drizzle } = require("drizzle-orm/neon-http");
import { neon } from "@neondatabase/serverless";

import * as schema from "@/db/schema"

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql, { schema });

const main = async () => {
    try {
        console.log("Reseting database");

        await db.delete(schema.courses);
        await db.delete(schema.userProgress);
        await db.delete(schema.units);
        await db.delete(schema.lessons);
        await db.delete(schema.challenges);
        await db.delete(schema.challengeOptions);
        await db.delete(schema.challengeProgress);
        await db.delete(schema.challengeGames);
        await db.delete(schema.userSubscriptionPayOS);

        console.log("Restart finished");
    } catch (error) {
        console.error(error);
        throw new Error("Failed to reset the database");
    }
}

main();