import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma";
import { auth } from "../../middlewares/auth";
import z from "zod";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";

const deletePrescriptionsParamsSchema = z.object({
	id: z.string().uuid(),
});

export async function deletePrescription(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.delete(
			"/prescriptions/:id",
			{
				schema: {
					tags: ["prescriptions"],
					summary: "Delete a prescription",
					security: [{ bearerAuth: [] }],
					params: deletePrescriptionsParamsSchema,
					response: {
						204: defaultSuccessResponseSchema(z.null()).describe("No Content"),
						401: defaultErrorResponseSchema.describe("Unauthorized"),
						404: defaultErrorResponseSchema.describe("Prescription not found"),
					},
				},
			},
			async (request, reply) => {
				await request.getCurrentUserId();

				const { id } = request.params;

				const prescription = await prisma.prescription.findUnique({
					where: { id },
				});

				if (!prescription) {
					return reply.status(404).send({
						success: false,
						error: "Prescription not found",
						data: null,
					});
				}

				await prisma.prescription.delete({
					where: { id },
				});

				return reply.status(204).send({
					success: true,
					error: null,
					data: null,
				});
			}
		);
}
