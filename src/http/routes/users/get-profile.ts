import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { BadRequestError } from "../_errors/bad-request-error";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middleware/auth";
import { z } from "zod";

export async function getProfile(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.get(
			`/me`,
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
					throw new BadRequestError("User not found");
				}

				return reply.send({ user });
			}
		);
}