import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma";
import { auth } from "../../middleware/auth";
import z from "zod";

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
					params: z.object({
						id: z.string().uuid(),
					}),
					response: {
						204: z.null(),
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

				const { id } = z
					.object({ id: z.string().uuid() })
					.parse(request.params);

				const prescription = await prisma.prescription.findUnique({
					where: { id },
				});

				if (!prescription) {
					return reply.status(404).send({
						error: "Prescription not found",
					});
				}

				await prisma.prescription.delete({
					where: { id },
				});

				return reply.status(204).send();
			}
		);
}
