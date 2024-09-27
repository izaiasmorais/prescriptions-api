import { prisma } from "../../lib/prisma";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
						token: z.string(),
						expiresAt: z.number(),
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

			const hashedPassword = await bcrypt.hash(password, 10);

			const newUser = await prisma.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
				},
			});

			const expiresIn = "24h";
			const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

			const token = jwt.sign(
				{ userId: newUser.id },
				process.env.JWT_SECRET || "defaultsecret",
				{ expiresIn }
			);

			return reply.status(201).send({
				message: "User registered successfully",
				token,
				expiresAt: expirationTime,
			});
		}
	);
}
