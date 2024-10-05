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
					params: z.object({
						id: z.string().uuid(),
					}),
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
				const { id } = z
					.object({ id: z.string().uuid() })
					.parse(request.params);

				const userId = await request.getCurrentUserId();

				const user = await prisma.user.findUnique({
					where: { id },
				});

				if (!user) {
					return reply.status(404).send({
						error: "User not found",
					});
				}

				if (userId !== id) {
					return reply.status(403).send({
						error: "You are not allowed to delete this user",
					});
				}

				await prisma.user.delete({
					where: { id },
				});

				return reply.status(204).send();
			}
		);
}
