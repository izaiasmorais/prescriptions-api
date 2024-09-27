import { prisma } from "../../lib/prisma";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import bcrypt from "bcrypt";

const signInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

type SignInBody = z.infer<typeof signInSchema>;

export async function signIn(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/auth/sign-in",
		{
			schema: {
				tags: ["auth"],
				summary: "Authenticate with password",
				body: z.object({
					email: z.string().email(),
					password: z.string().min(6),
				}),
				response: {
					200: z.object({
						token: z.string(),
					}),
					400: z.object({
						error: z.string(),
					}),
					401: z.object({
						error: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { email, password } = request.body as SignInBody;

			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				return reply.status(401).send({
					error: "Invalid email or password",
				});
			}

			const passwordMatch = await bcrypt.compare(password, user.password);

			if (!passwordMatch) {
				return reply.status(401).send({
					error: "Invalid password",
				});
			}

			const token = await reply.jwtSign(
				{
					sub: user.id,
				},
				{
					sign: {
						expiresIn: "1d",
					},
				}
			);

			return reply.status(200).send({
				token,
			});
		}
	);
}
