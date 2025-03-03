import { z } from "zod";
import "dotenv/config";

export const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string(),
	PORT: z.coerce.number().optional().default(3333),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	console.error("❌ Invalid environment variables", _env.error.format());

	throw new Error("Invalid environment variables.");
}

export const env = _env.data;
