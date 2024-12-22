import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middleware/auth";
import z from "zod";

const editPrescriptionsSchema = z.object({
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

type EditPrescriptionBody = z.infer<typeof editPrescriptionsSchema>;

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
					params: z.object({
						id: z.string(),
					}),
					body: z.object({
						medicalRecord: z.string(),
						name: z.string(),
						medicine: z.string(),
						unit: z.string(),
						dose: z.number(),
						via: z.string(),
						posology: z.string(),
						posologyDays: z.array(z.string()),
					}),
					response: {
						200: z.object({
							id: z.string(),
							medicalRecord: z.string(),
							name: z.string(),
							medicine: z.string(),
							unit: z.string(),
							dose: z.number(),
							via: z.string(),
							posology: z.string(),
							posologyDays: z.array(z.string()),
						}),
						400: z.object({
							error: z.string(),
						}),
						401: z.object({
							error: z.string(),
						}),
						404: z.object({
							error: z.string(),
						}),
					},
				},
			},
			async (request, reply) => {
				await request.getCurrentUserId();

				try {
					const { id } = request.params as { id: string };
					const {
						medicalRecord,
						name,
						medicine,
						unit,
						dose,
						via,
						posology,
						posologyDays,
					} = request.body as Omit<EditPrescriptionBody, "id">;

					const prescription = await prisma.prescription.findUnique({
						where: { id },
					});

					if (!prescription) {
						return reply.status(404).send({ error: "Prescription not found" });
					}

					const updatedPrescription = await prisma.prescription.update({
						where: { id },
						data: {
							medicalRecord,
							name,
							medicine,
							unit,
							dose,
							via,
							posology,
							posologyDays,
						},
					});

					return reply.status(200).send(updatedPrescription);
				} catch (error) {
					return reply
						.status(400)
						.send({ error: "Failed to edit prescription" });
				}
			}
		);
}
