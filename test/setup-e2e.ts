import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { execSync } from "node:child_process";

const prisma = new PrismaClient();

function generateUniqueDatabaseURL(schemaId: string) {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL must be set");
	}

	const url = new URL(process.env.DATABASE_URL);

	url.searchParams.set("schema", schemaId);

	return url.toString();
}

const schemaId = randomUUID();

beforeAll(async () => {
	const databaseURL = generateUniqueDatabaseURL(schemaId);

	process.env.DATABASE_URL = databaseURL;

	console.log(process.env.DATABASE_URL);

	execSync("pnpm prisma migrate deploy");
});

afterAll(async () => {
	const response = await prisma.$executeRawUnsafe(
		`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`
	);
	console.log(response);
	await prisma.$disconnect();
});
