import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middleware/auth";
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
