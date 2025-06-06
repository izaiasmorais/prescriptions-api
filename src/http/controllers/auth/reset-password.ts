import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma";
import { verifyJwt } from "../../middlewares/auth";
import { resetPasswordRequestSchema } from "../../schemas/auth";
import { errorResponseSchema } from "../../schemas/http";
import { successResponseSchema } from "../../schemas/http";

import bcrypt from "bcrypt";
import z from "zod";

export async function resetPassword(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()

		.put(
			"/auth/reset-password",
			{
				onRequest: [verifyJwt],
				schema: {
					tags: ["auth"],
					operationId: "resetPassword",
					summary: "Alterar senha do usuário autenticado",
					body: resetPasswordRequestSchema,
					response: {
						200: successResponseSchema(z.null()).describe("Success"),
						400: errorResponseSchema.describe("Bad Request"),
						401: errorResponseSchema.describe("Unauthorized"),
					},
				},
			},
			async (request, reply) => {
				const userId = request.user.sub;

				const user = await prisma.user.findUnique({
					where: { id: userId },
				});

				if (!user) {
					return reply.status(404).send({
						success: false,
						errors: ["Usuário não encontrado"],
						data: null,
					});
				}

				const { password, new_password } = request.body;

				const isPasswordValid = await bcrypt.compare(password, user.password);

				if (!isPasswordValid) {
					return reply.status(400).send({
						success: false,
						errors: ["A senha atual é inválida"],
						data: null,
					});
				}

				if (password === new_password) {
					return reply.status(400).send({
						success: false,
						errors: ["A nova senha deve ser diferente da senha atual"],
						data: null,
					});
				}

				const newPasswordHashed = await bcrypt.hash(new_password, 10);

				await prisma.user.update({
					where: { id: userId },
					data: { password: newPasswordHashed },
				});

				return reply.status(200).send({
					success: true,
					errors: null,
					data: null,
				});
			}
		);
}
