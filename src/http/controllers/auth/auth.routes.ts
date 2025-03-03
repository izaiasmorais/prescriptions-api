import type { FastifyInstance } from "fastify";
import { deleteAccount } from "./delete-account";
import { getProfile } from "./get-profile";
import { signIn } from "./sign-in";
import { signUp } from "./sign-up";
import { resetPassword } from "./reset-password";

export async function authRoutes(app: FastifyInstance) {
	app.register(signUp);
	app.register(signIn);
	app.register(deleteAccount);
	app.register(getProfile);
	app.register(resetPassword);
}
