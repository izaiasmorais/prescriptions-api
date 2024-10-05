import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middleware/auth";
import z from "zod";

export async function getPrescriptions(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.get(
			"/prescriptions",
			{
				schema: {
					tags: ["prescriptions"],
					summary: "Get all prescriptions",
					security: [{ bearerAuth: [] }],
					response: {
						200: z.array(
							z.object({
								id: z.string(),
								medicalRecord: z.string(),
								name: z.string(),
								medicine: z.string(),
								unit: z.string(),
								dose: z.number(),
								via: z.string(),
								posology: z.string(),
								posologyDays: z.array(z.string()),
							})
						),
						401: z.object({
							error: z.string(),
						}),
					},
				},
			},

			async () => {
				const prescriptions = await prisma.prescription.findMany({
					select: {
						id: true,
						medicalRecord: true,
						name: true,
						medicine: true,
						unit: true,
						dose: true,
						via: true,
						posology: true,
						posologyDays: true,
					},
				});

				return prescriptions;
			}
		);
}
