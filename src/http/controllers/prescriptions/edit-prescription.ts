import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth } from "../../middlewares/auth.js";
import z from "zod";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";
import { prescriptionsRequestBodySchema } from "http/schemas/prescription.js";

const editPrescriptionParamsSchema = z.object({
	id: z.string(),
});

export async function editPrescription(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.put(
			"/prescriptions/:id",
			{
				schema: {
					tags: ["prescriptions"],
					summary: "Edit an existing prescription",
					security: [{ bearerAuth: [] }],
					params: editPrescriptionParamsSchema,
					body: prescriptionsRequestBodySchema,
					response: {
						204: defaultSuccessResponseSchema(z.null()).describe("No Content"),
						400: defaultErrorResponseSchema.describe("Bad Request"),
						401: defaultErrorResponseSchema.describe("Unauthorized"),
						404: defaultErrorResponseSchema.describe("Not Found"),
					},
				},
			},
			async (request, reply) => {
				await request.getCurrentUserId();

				const { id } = request.params;

				const body = prescriptionsRequestBodySchema.parse(request.body);

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

				await prisma.prescription.update({
					where: { id },
					data: body,
				});

				return reply.status(200).send({
					success: true,
					error: null,
					data: null,
				});
			}
		);
}
