
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import z from "zod";

export async function deleteUser(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().delete(
		"/users/:id",
		{
			schema: {
				tags: ["users"],
				summary: "Delete a user by ID",
				params: z.object({
					id: z.string().uuid(),
				}),
				response: {
					200: z.object({
						message: z.string(),
					}),
					404: z.object({
						error: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params as { id: string };

			const user = await prisma.user.findUnique({
				where: { id },
			});

			if (!user) {
				return reply.status(404).send({
					error: "User not found",
				});
			}

			await prisma.user.delete({
				where: { id },
			});

			return reply.status(200).send({
				message: "User deleted successfully",
			});
		}
	);
}
