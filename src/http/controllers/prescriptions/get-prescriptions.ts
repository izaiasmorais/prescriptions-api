import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { verifyJwt } from "../../middlewares/auth.js";
import {
	errorResponseSchema,
	successResponseSchema,
} from "../../schemas/http.js";
import {
	getPrescriptionsQuerySchema,
	getPrescriptionsResponseSchema,
} from "../../schemas/prescription";
import { Prisma } from "@prisma/client";

export async function getPrescriptions(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/prescriptions",
		{
			onRequest: [verifyJwt],
			schema: {
				tags: ["prescriptions"],
				operationId: "getPrescriptions",
				summary: "Busca prescrições",
				security: [{ bearerAuth: [] }],
				querystring: getPrescriptionsQuerySchema,
				response: {
					200: successResponseSchema(getPrescriptionsResponseSchema).describe(
						"OK"
					),
					401: errorResponseSchema.describe("Unauthorized"),
				},
			},
		},
		async (request, reply) => {
			const {
				pageIndex = 0,
				perPage = 5,
				id,
				medicalRecord,
				patientName,
				medicine,
				dose,
				unit,
				posology,
			} = request.query;

			const whereClause: Prisma.PrescriptionWhereInput = {
				...(id && { id: { contains: id } }),
				...(medicalRecord && { medicalRecord: { contains: medicalRecord } }),
				...(patientName && {
					patientName: {
						contains: patientName,
						mode: Prisma.QueryMode.insensitive,
					},
				}),
				...(medicine && {
					medicine: {
						contains: medicine,
						mode: Prisma.QueryMode.insensitive,
					},
				}),
				...(dose && {
					dose: {
						contains: dose,
						mode: Prisma.QueryMode.insensitive,
					},
				}),
				...(unit && {
					unit: {
						contains: unit,
						mode: Prisma.QueryMode.insensitive,
					},
				}),
				...(posology && {
					posology: {
						contains: posology,
						mode: Prisma.QueryMode.insensitive,
					},
				}),
			};

			const [prescriptions, totalItems] = await Promise.all([
				prisma.prescription.findMany({
					skip: pageIndex * perPage,
					take: perPage,
					where: whereClause,
				}),
				prisma.prescription.count({ where: whereClause }),
			]);

			return reply.send({
				success: true,
				errors: null,
				data: {
					prescriptions,
					meta: {
						page: pageIndex,
						itemsPerPage: perPage,
						totalItems,
						totalPages: Math.ceil(totalItems / perPage),
					},
				},
			});
		}
	);
}
