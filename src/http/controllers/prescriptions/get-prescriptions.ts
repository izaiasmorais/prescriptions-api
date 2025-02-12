import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth } from "../../middlewares/auth.js";
import z from "zod";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";

const prescriptionSchema = z.object({
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

const getPrescriptionsResponseBodySchema = z.object({
	prescriptions: z.array(prescriptionSchema),
	meta: z.object({
		pageIndex: z.number(),
		perPage: z.number(),
		totalCount: z.number(),
	}),
});

const getPrescriptionsQuerySchema = z.object({
	pageIndex: z.coerce.number().int().nonnegative().optional(),
	perPage: z.coerce.number().int().positive().optional(),
	id: z.string().nullable().optional(),
	medicalRecord: z.string().nullable().optional(),
	name: z.string().nullable().optional(),
	medicine: z.string().nullable().optional(),
	unit: z.string().nullable().optional(),
	dose: z.coerce.number().nullable().optional(),
	posology: z.string().nullable().optional(),
});

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
					querystring: getPrescriptionsQuerySchema,
					response: {
						200: defaultSuccessResponseSchema(
							getPrescriptionsResponseBodySchema
						).describe("OK"),
						401: defaultErrorResponseSchema.describe("Unauthorized"),
					},
				},
				preHandler: async (request) => {
					await request.getCurrentUserId();
				},
			},
			async (request, reply) => {
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
				} = request.query;

				const page = pageIndex || 0;
				const itemsPerPage = perPage || 5;

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
					},
				});

				const totalCount = await prisma.prescription.count({
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
					},
				});

				return reply.send({
					success: true,
					error: null,
					data: {
						prescriptions,
						meta: {
							pageIndex: page,
							perPage: itemsPerPage,
							totalCount,
						},
					},
				});
			}
		);
}
