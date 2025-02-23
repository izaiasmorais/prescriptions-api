import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth } from "../../middlewares/auth.js";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";
import {
	getPrescriptionsQuerySchema,
	getPrescriptionsResponseBodySchema,
} from "../../schemas/prescription";

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
					patientName,
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
						patientName: true,
						medicine: true,
						unit: true,
						dose: true,
						via: true,
						posology: true,
						treatmentDays: true,
					},
					where: {
						id: id ? { contains: id } : undefined,
						medicalRecord: medicalRecord
							? { contains: medicalRecord }
							: undefined,
						patientName: patientName
							? { contains: patientName, mode: "insensitive" }
							: undefined,
						medicine: medicine
							? { contains: medicine, mode: "insensitive" }
							: undefined,
						dose: dose ? { contains: dose, mode: "insensitive" } : undefined,
						unit: unit ? { contains: unit, mode: "insensitive" } : undefined,
						posology: posology
							? { contains: posology, mode: "insensitive" }
							: undefined,
					},
				});

				const totalCount = await prisma.prescription.count({
					where: {
						id: id ? { contains: id } : undefined,
						medicalRecord: medicalRecord
							? { contains: medicalRecord }
							: undefined,
						patientName: patientName
							? { contains: patientName, mode: "insensitive" }
							: undefined,
						medicine: medicine
							? { contains: medicine, mode: "insensitive" }
							: undefined,
						dose: dose ? { contains: dose, mode: "insensitive" } : undefined,
						unit: unit ? { contains: unit, mode: "insensitive" } : undefined,
						posology: posology
							? { contains: posology, mode: "insensitive" }
							: undefined,
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
