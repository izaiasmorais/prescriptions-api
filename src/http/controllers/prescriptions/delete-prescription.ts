import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma";
import { verifyJwt } from "../../middlewares/auth";
import { errorResponseSchema, successResponseSchema } from "../../schemas/http";

import z from "zod";

export async function deletePrescription(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()

		.delete(
			"/prescriptions/:id",
			{
				onRequest: [verifyJwt],
				schema: {
					tags: ["prescriptions"],
					operationId: "deletePrescription",
					summary: "Deletar uma prescrição",
					security: [{ bearerAuth: [] }],
					params: z.object({
						id: z.string().uuid(),
					}),
					response: {
						204: successResponseSchema(z.null()).describe("No Content"),
						401: errorResponseSchema.describe("Unauthorized"),
						404: errorResponseSchema.describe("Prescription not found"),
					},
				},
			},
			async (request, reply) => {
				const { id } = request.params;

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

				await prisma.prescription.delete({
					where: { id },
				});

				return reply.status(204).send({
					success: true,
					errors: null,
					data: null,
				});
			}
		);
}
