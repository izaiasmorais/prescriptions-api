import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import bcrypt from "bcrypt";
import z from "zod";
import { prisma } from "../../../libs/prisma.js";

const signUpSchema = z.object({
	name: z.string(),
	email: z.string().email(),
	password: z.string().min(6),
});

type SignUpBody = z.infer<typeof signUpSchema>;

export async function signUp(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/auth/sign-up",
		{
			schema: {
				tags: ["auth"],
				summary: "Register a new user",
				body: z.object({
					name: z.string(),
					email: z.string().email(),
					password: z.string().min(6),
				}),
				response: {
					201: z.object({
						message: z.string(),
					}),
					400: z.object({
						error: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { name, email, password } = request.body as SignUpBody;

			const emailAlreadyExists = await prisma.user.findUnique({
				where: { email },
			});

			if (emailAlreadyExists) {
				return reply.status(400).send({
					error: "Email already registered",
				});
			}

			if (password.length < 6) {
				return reply.status(400).send({
					error: "Password must be at least 6 characters",
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
				message: "User registered successfully",
			});
		}
	);
}
