import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import bcrypt from "bcrypt";
import z from "zod";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";

const signInRequestBodySchema = z.object({
	email: z.string().email("Email inválido"),
	password: z.string().min(6, "Password must contain at least 6 characters"),
});

const signInResponseBodySchema = z.object({
	token: z.string().jwt(),
});

export async function signIn(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/auth/sign-in",
		{
			schema: {
				tags: ["auth"],
				summary: "Authenticate with password",
				body: signInRequestBodySchema,
				response: {
					201: defaultSuccessResponseSchema(signInResponseBodySchema).describe(
						"Created"
					),
					400: defaultErrorResponseSchema.describe("Bad Request"),
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
					error: "Credenciais inválidas",
					data: null,
				});
			}

			const passwordMatch = await bcrypt.compare(password, user.password);

			if (!passwordMatch) {
				return reply.status(400).send({
					success: false,
					error: "Credenciais inválidas",
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
				error: null,
				data: {
					token,
				},
			});
		}
	);
}
