import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth } from "../../middleware/auth.js";
import { z } from "zod";

export async function getProfile(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.get(
			`/profile`,
			{
				schema: {
					tags: ["auth"],
					summary: "Get authenticated user profile",
					security: [{ bearerAuth: [] }],
					response: {
						200: z.object({
							user: z.object({
								id: z.string().uuid(),
								name: z.string().nullable(),
								email: z.string().email(),
							}),
						}),
						401: z.object({
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

				const user = await prisma.user.findUnique({
					select: {
						id: true,
						email: true,
						name: true,
					},
					where: {
						id: userId,
					},
				});

				if (!user) {
					return reply.status(404).send({
						error: "User not found",
					});
				}

				return reply.send({ user });
			}
		);
}
