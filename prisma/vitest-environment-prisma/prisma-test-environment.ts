import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { Environment } from "vitest";

// We need to create a fake MySQL database and a shadow database for each test
function generateDatabaseURL(database: string, baseUrl: string): string {
	const url = new URL(baseUrl);
	url.pathname = `/${database}`;
	return url.toString();
}

export default <Environment>{
	name: "prisma",
	async setup() {
		// Check if the environment variables are set
		if (!process.env.DATABASE_URL || !process.env.SHADOW_DATABASE_URL) {
			throw new Error(
				"Please set the DATABASE_URL and SHADOW_DATABASE_URL environment variables."
			);
		}

		// execute before each test
		const database = `test_${randomUUID().replace(/-/g, "")}`; // create a test database name
		const shadowDatabase = `shadow_${randomUUID().replace(/-/g, "")}`; // create a shadow database name
		const databaseURL = generateDatabaseURL(database, process.env.DATABASE_URL);
		const shadowDatabaseURL = generateDatabaseURL(
			shadowDatabase,
			process.env.SHADOW_DATABASE_URL
		);

		process.env.DATABASE_URL = databaseURL; // set the test database url
		process.env.SHADOW_DATABASE_URL = shadowDatabaseURL; // set the shadow database url

		const prisma = new PrismaClient();

		execSync("npx prisma migrate reset --force"); // apply the migrations to the new test database

		return {
			async teardown() {
				// execute after each test and rop the test database in fake MySQL
				await prisma.$executeRawUnsafe(
					`DROP SCHEMA IF EXISTS "${database}" CASCADE`
				);
				await prisma.$executeRawUnsafe(
					`DROP SCHEMA IF EXISTS "${shadowDatabase}" CASCADE`
				);

				await prisma.$disconnect(); // disconnect from the fake MySQL
			},
		};
	},
};
