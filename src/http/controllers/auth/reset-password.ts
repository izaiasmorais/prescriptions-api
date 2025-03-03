import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import bcrypt from "bcrypt";
import z from "zod";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";
import { auth } from "../../middlewares/auth.js";

const resetPasswordRequestBodySchema = z
	.object({
		password: z
			.string()
			.min(6, "A senha atual deve conter pelo menos 6 caracteres"),
		new_password: z
			.string()
			.min(6, "A nova senha deve conter pelo menos 6 caracteres"),
	})
	.refine((data) => data.password !== data.new_password, {
		message: "A nova senha deve ser diferente da senha atual",
	});

export async function resetPassword(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.put(
			"/auth/reset-password",
			{
				schema: {
					tags: ["auth"],
					summary: "Alterar senha do usuário autenticado",
					body: resetPasswordRequestBodySchema,
					response: {
						200: defaultSuccessResponseSchema(z.null()).describe("Success"),
						400: defaultErrorResponseSchema.describe("Bad Request"),
						401: defaultErrorResponseSchema.describe("Unauthorized"),
					},
				},
			},
			async (request, reply) => {
				const userId = await request.getCurrentUserId();

				const { password, new_password } = request.body;

				const user = await prisma.user.findUnique({
					where: { id: userId },
				});

				if (!user) {
					return reply.status(404).send({
						success: false,
						error: "Usuário não encontrado",
						data: null,
					});
				}

				const passwordMatch = await bcrypt.compare(password, user.password);

				if (!passwordMatch) {
					return reply.status(400).send({
						success: false,
						error: "Senha atual inválida",
						data: null,
					});
				}

				if (password === new_password) {
					return reply.status(400).send({
						success: false,
						error: "A nova senha deve ser diferente da senha atual",
						data: null,
					});
				}

				const hashedNewPassword = await bcrypt.hash(new_password, 10);

				await prisma.user.update({
					where: { id: userId },
					data: { password: hashedNewPassword },
				});

				return reply.status(200).send({
					success: true,
					error: null,
					data: null,
				});
			}
		);
}
