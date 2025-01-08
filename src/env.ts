import { z } from "zod";
import "dotenv/config";

export const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string(),
	PORT: z.coerce.number().optional().default(3333),
});

export const env = envSchema.parse(process.env);
