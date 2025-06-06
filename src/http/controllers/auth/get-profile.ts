import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { verifyJwt } from "../../middlewares/auth.js";
import {
	errorResponseSchema,
	successResponseSchema,
} from "../../schemas/http";
import { getProfileResponseSchema } from "../../schemas/auth";

export async function getProfile(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/auth/profile",
		{
			onRequest: [verifyJwt],
			schema: {
				tags: ["auth"],
				operationId: "getProfile",
				summary: "Obter perfil do usuário autenticado",
				security: [{ bearerAuth: [] }],
				response: {
					200: successResponseSchema(getProfileResponseSchema),
					401: errorResponseSchema.describe("Unauthorized"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.sub;

			const user = await prisma.user.findUnique({
				where: {
					id: userId,
				},
				select: {
					id: true,
					email: true,
					name: true,
				},
			});

			if (!user) {
				return reply.status(404).send({
					success: false,
					errors: ["Usuário não encontrado"],
					data: null,
				});
			}

			return reply.status(200).send({
				success: true,
				errors: null,
				data: user,
			});
		}
	);
}
