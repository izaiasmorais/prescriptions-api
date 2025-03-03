import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import bcrypt from "bcrypt";
import z from "zod";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";

const resetPasswordRequestBodySchema = z
	.object({
		currentPassword: z
			.string()
			.min(6, "A senha atual deve conter pelo menos 6 caracteres"),
		newPassword: z
			.string()
			.min(6, "A nova senha deve conter pelo menos 6 caracteres"),
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "A nova senha deve ser diferente da senha atual",
	});

export async function resetPassword(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
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

			const { currentPassword, newPassword } = request.body;

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return reply.status(401).send({
					success: false,
					error: "Usuário não encontrado",
					data: null,
				});
			}

			const passwordMatch = await bcrypt.compare(
				currentPassword,
				user.password
			);

			if (!passwordMatch) {
				return reply.status(401).send({
					success: false,
					error: "Senha atual inválida",
					data: null,
				});
			}

			if (currentPassword === newPassword) {
				return reply.status(400).send({
					success: false,
					error: "A nova senha deve ser diferente da senha atual",
					data: null,
				});
			}

			const hashedNewPassword = await bcrypt.hash(newPassword, 10);

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
