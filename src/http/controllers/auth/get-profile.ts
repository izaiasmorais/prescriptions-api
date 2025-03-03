import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth, verifyJwt } from "../../middlewares/auth.js";
import { z } from "zod";
import {
	defaultSuccessResponseSchema,
	defaultErrorResponseSchema,
} from "../../schemas/response";

const userSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().email(),
});

export async function getProfile(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.get(
			`/auth/profile`,
			{
				onRequest: [verifyJwt],
				schema: {
					tags: ["auth"],
					summary: "Get authenticated user profile",
					security: [{ bearerAuth: [] }],
					response: {
						200: defaultSuccessResponseSchema(userSchema),
						401: defaultErrorResponseSchema.describe("Unauthorized"),
						404: defaultErrorResponseSchema.describe("Not Found"),
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
						success: false,
						error: "Usuário não encontrado",
						data: null,
					});
				}

				return reply.send({
					success: true,
					error: null,
					data: user,
				});
			}
		);
}
