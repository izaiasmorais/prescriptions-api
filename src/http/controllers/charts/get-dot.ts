import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth, verifyJwt } from "../../middlewares/auth.js";
import { z } from "zod";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";

const getDotChartRequestQuerySchema = z.object({
	unit: z.string(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
});

const getDotChartResponseBodySchema = z.object({
	dot: z.number(),
});

export async function getDotChart(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.get(
			"/charts/dot",
			{
				onRequest: [verifyJwt],
				schema: {
					tags: ["charts"],
					summary: "Get DOT chart",
					security: [{ bearerAuth: [] }],
					querystring: getDotChartRequestQuerySchema,
					response: {
						200: defaultSuccessResponseSchema(
							getDotChartResponseBodySchema
						).describe("OK"),
						400: defaultErrorResponseSchema.describe("Bad Request"),
						401: defaultErrorResponseSchema.describe("Unauthorized"),
					},
				},
			},
			async (request, reply) => {
				const { unit, startDate, endDate } = request.query;

				const start = new Date(startDate);
				const end = new Date(endDate);

				const prescriptions = await prisma.prescription.findMany({
					where: {
						unit: unit !== "all" ? unit : undefined,
					},
				});

				const groupedPrescriptions = prescriptions.reduce<
					Record<string, Set<string>>
				>((acc, prescription) => {
					if (!acc[prescription.medicine]) {
						acc[prescription.medicine] = new Set();
					}

					prescription.treatmentDays.forEach((date) => {
						const treatmentDate = new Date(date);
						if (treatmentDate >= start && treatmentDate <= end) {
							acc[prescription.medicine].add(
								treatmentDate.toISOString().split("T")[0] + "T00:00:00.000Z"
							);
						}
					});

					return acc;
				}, {});

				console.log(groupedPrescriptions);

				const dot = Object.values(groupedPrescriptions).reduce(
					(total, dates) => total + dates.size,
					0
				);

				return reply.status(200).send({
					success: true,
					error: null,
					data: { dot },
				});
			}
		);
}
