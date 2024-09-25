import { prisma } from "../../lib/prisma";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function getUsers(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/users",
		{
			schema: {
				tags: ["users"],
				summery: "Get all users",
				response: {
					200: z.array(
						z.object({
							id: z.string(),
							name: z.string(),
							email: z.string(),
							password: z.string(),
						})
					),
				},
			},
		},

		async () => {
			const users = await prisma.user.findMany({
				select: {
					id: true,
					name: true,
					email: true,
					password: true,
				},
			});

			return users;
		}
	);
}
