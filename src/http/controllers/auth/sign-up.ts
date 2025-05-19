import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import bcrypt from "bcrypt";
import z from "zod";
import {
	errorResponseSchema,
	successResponseSchema,
} from "../../schemas/http.js";
import { signUpRequestSchema } from "http/schemas/auth.js";

export async function signUp(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/auth/sign-up",
		{
			schema: {
				tags: ["auth"],
				operationId: "signUp",
				summary: "Cadastrar um novo usuário",
				body: signUpRequestSchema,
				response: {
					201: successResponseSchema(z.null()).describe("Created"),
					400: errorResponseSchema.describe("Bad Request"),
					409: errorResponseSchema.describe("Conflict"),
				},
			},
		},
		async (request, reply) => {
			const { name, email, password } = request.body;

			const emailAlreadyExists = await prisma.user.findUnique({
				where: { email },
			});

			if (emailAlreadyExists) {
				return reply.status(409).send({
					success: false,
					errors: ["Usuário já cadastrado"],
					data: null,
				});
			}

			const hashedPassword = await bcrypt.hash(password, 6);

			await prisma.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
				},
			});

			return reply.status(201).send({
				success: true,
				errors: null,
				data: null,
			});
		}
	);
}
