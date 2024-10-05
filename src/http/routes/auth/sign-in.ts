import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { BadRequestError } from "../_errors/bad-request-error";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import z from "zod";

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
					201: z.object({
						token: z.string(),
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
				throw new BadRequestError("Invalid email!");
			}

			const passwordMatch = await bcrypt.compare(password, user.password);

			if (!passwordMatch) {
				throw new BadRequestError("Invalid password!");
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

			return reply.status(201).send({
				token,
			});
		}
	);
}
