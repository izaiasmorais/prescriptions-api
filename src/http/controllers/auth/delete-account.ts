import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth } from "../../middlewares/auth.js";
import z from "zod";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";

export async function deleteAccount(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.delete(
			"/auth/delete-account",
			{
				schema: {
					tags: ["auth"],
					summary: "Delete your own account",
					security: [{ bearerAuth: [] }],
					response: {
						204: defaultSuccessResponseSchema(z.null()).describe("No Content"),
						401: defaultErrorResponseSchema.describe("Unauthorized"),
						404: defaultErrorResponseSchema.describe("Not Found"),
					},
				},
			},
			async (request, reply) => {
				const userId = await request.getCurrentUserId();

				const user = await prisma.user.findUnique({
					where: {
						id: userId,
					},
				});

				if (!user) {
					return reply.status(404).send({
						success: false,
						error: "Usuário não encontrado",
						data: null,
					});
				}

				await prisma.user.delete({
					where: { id: userId },
				});

				return reply.status(204).send({
					success: true,
					error: null,
					data: null,
				});
			}
		);
}
