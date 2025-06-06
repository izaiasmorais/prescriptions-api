import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma";
import { verifyJwt } from "../../middlewares/auth";
import { prescriptionRequestSchema } from "../../schemas/prescription";
import { getCurrentDate } from "../../../utils/get-current-date";
import { errorResponseSchema, successResponseSchema } from "../../schemas/http";

import z from "zod";

export async function editPrescription(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().put(
		"/prescriptions/:id",
		{
			onRequest: [verifyJwt],
			schema: {
				tags: ["prescriptions"],
				operationId: "editPrescription",
				summary: "Editar uma prescrição existente",
				security: [{ bearerAuth: [] }],
				params: z.object({
					id: z.string().uuid(),
				}),
				body: prescriptionRequestSchema,
				response: {
					204: successResponseSchema(z.null()).describe("No Content"),
					400: errorResponseSchema.describe("Bad Request"),
					401: errorResponseSchema.describe("Unauthorized"),
					404: errorResponseSchema.describe("Not Found"),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const body = prescriptionRequestSchema.parse(request.body);

			const prescription = await prisma.prescription.findUnique({
				where: { id, userId: request.user.sub },
			});

			if (!prescription) {
				return reply.status(404).send({
					success: false,
					errors: ["Prescrição não encontrada"],
					data: null,
				});
			}

			await prisma.prescription.update({
				where: { id },
				data: {
					...body,
					updatedAt: getCurrentDate(),
				},
			});

			return reply.status(200).send({
				success: true,
				errors: null,
				data: null,
			});
		}
	);
}
