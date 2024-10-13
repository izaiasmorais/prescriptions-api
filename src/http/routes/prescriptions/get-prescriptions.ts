import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../middleware/auth";
import z from "zod";
import type { GetPrescriptionsQueryParams } from "../../../models/prescriptions";

export async function getPrescriptions(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.get(
			"/prescriptions",
			{
				schema: {
					tags: ["prescriptions"],
					summary: "Get paginated prescriptions",
					security: [{ bearerAuth: [] }],
					querystring: z.object({
						pageIndex: z.coerce.number().int().nonnegative().optional(),
						perPage: z.coerce.number().int().positive().optional(),
						id: z.string().nullable().optional(),
						medicalRecord: z.string().nullable().optional(),
						name: z.string().nullable().optional(),
						medicine: z.string().nullable().optional(),
						unit: z.string().nullable().optional(),
						dose: z.coerce.number().nullable().optional(),
						posology: z.string().nullable().optional(),
						posologyDays: z.array(z.string()).nullable().optional(),
					}),
					response: {
						200: z.object({
							prescriptions: z.array(
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
							meta: z.object({
								pageIndex: z.number(),
								perPage: z.number(),
								totalCount: z.number(),
							}),
						}),
						401: z.object({
							error: z.string(),
						}),
					},
				},
			},
			async (request) => {
				const {
					pageIndex,
					perPage,
					id,
					medicalRecord,
					name,
					medicine,
					dose,
					unit,
					posology,
					posologyDays,
				} = request.query as GetPrescriptionsQueryParams;

				const page = pageIndex || 0;
				const itemsPerPage = perPage || 5;
				const totalCount = await prisma.prescription.count();

				const prescriptions = await prisma.prescription.findMany({
					skip: page * itemsPerPage,
					take: perPage,
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
					where: {
						id: id ? { contains: id } : undefined,
						medicalRecord: medicalRecord
							? { contains: medicalRecord }
							: undefined,
						name: name ? { contains: name, mode: "insensitive" } : undefined,
						medicine: medicine
							? { contains: medicine, mode: "insensitive" }
							: undefined,
						dose: dose ? { equals: dose } : undefined,
						unit: unit ? { contains: unit, mode: "insensitive" } : undefined,
						posology: posology ? { contains: posology } : undefined,
						posologyDays: posologyDays
							? { hasSome: [...posologyDays] }
							: undefined,
					},
				});

				return {
					prescriptions,
					meta: {
						pageIndex,
						perPage,
						totalCount,
					},
				};
			}
		);
}
