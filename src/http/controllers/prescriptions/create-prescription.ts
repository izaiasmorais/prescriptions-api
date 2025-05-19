import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { verifyJwt } from "../../middlewares/auth";
import { prescriptionRequestSchema } from "../../schemas/prescription";
import { getCurrentDate } from "../../../utils/get-current-date.js";
import {
	errorResponseSchema,
	successResponseSchema,
} from "../../schemas/http.js";

import z from "zod";

export async function createPrescription(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()

		.post(
			"/prescriptions",
			{
				onRequest: [verifyJwt],
				schema: {
					tags: ["prescriptions"],
					operationId: "createPrescription",
					summary: "Criar uma nova prescrição",
					security: [{ bearerAuth: [] }],
					body: prescriptionRequestSchema,
					response: {
						201: successResponseSchema(z.null()).describe("Created"),
						400: errorResponseSchema.describe("Bad Request"),
						401: errorResponseSchema.describe("Unauthorized"),
					},
				},
			},
			async (request, reply) => {
				const body = prescriptionRequestSchema.parse(request.body);

				await prisma.prescription.create({
					data: {
						...body,
						userId: request.user.sub,
						createdAt: getCurrentDate(),
						updatedAt: null,
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
