import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth } from "../../middleware/auth.js";
import z from "zod";

export async function deleteAccount(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.delete(
			"/delete-account",
			{
				schema: {
					tags: ["auth"],
					summary: "Delete your own account",
					security: [{ bearerAuth: [] }],
					response: {
						204: z.null(),
						401: z.object({
							error: z.string(),
						}),
						403: z.object({
							error: z.string(),
						}),
						404: z.object({
							error: z.string(),
						}),
					},
				},
			},
			async (request, reply) => {
				const userId = await request.getCurrentUserId();

				await prisma.user.delete({
					where: { id: userId },
				});

				return reply.status(204).send();
			}
		);
}
