import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import bcrypt from "bcrypt";
import z from "zod";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";

const signUpRequestBodySchema = z.object({
	name: z.string().min(5, "Name is required"),
	email: z.string().email("Invalid email"),
	password: z.string().min(6, "Password must contain at least 6 characters"),
});

export async function signUp(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/auth/sign-up",
		{
			schema: {
				tags: ["auth"],
				summary: "Register a new user",
				body: signUpRequestBodySchema,
				response: {
					201: defaultSuccessResponseSchema(z.null()).describe("Created"),
					400: defaultErrorResponseSchema.describe("Bad Request"),
					409: defaultErrorResponseSchema.describe("Conflict"),
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
					error: "Usuário já cadastrado",
					data: null,
				});
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			await prisma.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
				},
			});

			return reply.status(201).send({
				success: true,
				error: null,
				data: null,
			});
		}
	);
}
