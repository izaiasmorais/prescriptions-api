import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { signInResponseSchema } from "../../schemas/auth";
import { signInRequestSchema } from "../../schemas/auth";
import { errorResponseSchema, successResponseSchema } from "../../schemas/http";

import bcrypt from "bcrypt";

export async function signIn(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/auth/sign-in",
		{
			schema: {
				tags: ["auth"],
				operationId: "signIn",
				summary: "Autenticar com senha",
				body: signInRequestSchema,
				response: {
					201: successResponseSchema(signInResponseSchema).describe("Created"),
					400: errorResponseSchema.describe("Bad Request"),
				},
			},
		},
		async (request, reply) => {
			const { email, password } = request.body;

			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				return reply.status(400).send({
					success: false,
					errors: ["Credenciais inválidas"],
					data: null,
				});
			}

			const isPasswordValid = await bcrypt.compare(password, user.password);

			if (!isPasswordValid) {
				return reply.status(400).send({
					success: false,
					errors: ["Credenciais inválidas"],
					data: null,
				});
			}

			const token = await reply.jwtSign(
				{
					sub: user.id,
				},
				{
					sign: {
						sub: user.id,
						expiresIn: "1d",
					},
				}
			);

			return reply.status(201).send({
				success: true,
				errors: null,
				data: {
					accessToken: token,
				},
			});
		}
	);
}
