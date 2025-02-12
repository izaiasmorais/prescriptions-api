import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth } from "../../middlewares/auth";
import z from "zod";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";

const createPrescriptionsRequestBodySchema = z.object({
	id: z.string(),
	medicalRecord: z.string(),
	name: z.string(),
	medicine: z.string(),
	unit: z.string(),
	dose: z.number(),
	via: z.string(),
	posology: z.string(),
	posologyDays: z.array(z.string()),
});

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
					body: createPrescriptionsRequestBodySchema,
					response: {
						204: defaultSuccessResponseSchema(z.null()).describe("No Content"),
						400: defaultErrorResponseSchema.describe("Bad Request"),
						401: defaultErrorResponseSchema.describe("Unauthorized"),
					},
				},
			},
			async (request, reply) => {
				await request.getCurrentUserId();

				const bodyData = request.body;

				await prisma.prescription.create({
					data: {
						...bodyData,
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
