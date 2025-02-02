import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth } from "../../middleware/auth.js";
import z from "zod";

const createPrescriptionsSchema = z.object({
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

type CreatePrescriptionBody = z.infer<typeof createPrescriptionsSchema>;

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
						201: z.object({
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
					},
				},
			},
			async (request, reply) => {
				await request.getCurrentUserId();

				try {
					const {
						medicalRecord,
						name,
						medicine,
						unit,
						dose,
						via,
						posology,
						posologyDays,
					} = request.body as CreatePrescriptionBody;

					if (
						!medicalRecord ||
						!name ||
						!medicine ||
						!unit ||
						!dose ||
						!via ||
						!posology ||
						!posologyDays.length
					) {
						return reply.status(400).send({ error: "Missing required fields" });
					}

					const newPrescription = await prisma.prescription.create({
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

					return reply.status(201).send(newPrescription);
				} catch (error) {
					return reply
						.status(400)
						.send({ error: "Failed to create prescription" });
				}
			}
		);
}
