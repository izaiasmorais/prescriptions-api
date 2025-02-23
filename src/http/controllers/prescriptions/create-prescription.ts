import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth } from "../../middlewares/auth";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";
import { prescriptionsRequestBodySchema } from "http/schemas/prescription.js";
import z from "zod";

export async function createPrescription(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.post(
			"/prescriptions",
			{
				schema: {
					tags: ["prescriptions"],
					summary: "Create a new prescription",
					security: [{ bearerAuth: [] }],
					body: prescriptionsRequestBodySchema,
					response: {
						201: defaultSuccessResponseSchema(z.null()).describe("Created"),
						400: defaultErrorResponseSchema.describe("Bad Request"),
						401: defaultErrorResponseSchema.describe("Unauthorized"),
					},
				},
			},
			async (request, reply) => {
				await request.getCurrentUserId();

				const body = prescriptionsRequestBodySchema.parse(request.body);

				await prisma.prescription.create({
					data: {
						...body,
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
