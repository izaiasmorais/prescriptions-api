import { FastifyInstance } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { UnauthorizedError } from "../../errors/unauthorized-error";
import { FastifyRequest } from "fastify";

export async function verifyJwt(request: FastifyRequest) {
	try {
		await request.jwtVerify();
	} catch (err) {
		throw new UnauthorizedError();
	}
}

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
	app.addHook("preHandler", async (request) => {
		request.getCurrentUserId = async () => {
			try {
				const { sub } = await request.jwtVerify<{ sub: string }>();

				return sub;
			} catch {
				throw new UnauthorizedError();
			}
		};
	});
});
