import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma";
import { verifyJwt } from "../../middlewares/auth";
import { getLotChartRequestQuerySchema } from "../../schemas/charts";
import { getLotChartResponseSchema } from "../../schemas/charts";
import { errorResponseSchema, successResponseSchema } from "../../schemas/http";

export async function getLot(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()

		.get(
			"/charts/lot",
			{
				onRequest: [verifyJwt],
				schema: {
					tags: ["charts"],
					operationId: "getLotChart",
					summary: "Obtém o gráfico de LOT",
					security: [{ bearerAuth: [] }],
					querystring: getLotChartRequestQuerySchema,
					response: {
						200: successResponseSchema(getLotChartResponseSchema).describe(
							"OK"
						),
						400: errorResponseSchema.describe("Bad Request"),
						401: errorResponseSchema.describe("Unauthorized"),
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

				const patientPrescriptions: Record<
					string,
					Set<string>
				> = prescriptions.reduce(
					(acc: Record<string, Set<string>>, prescription) => {
						const patientId = prescription.patientName;
						if (!acc[patientId]) {
							acc[patientId] = new Set();
						}

						prescription.treatmentDays.forEach((date) => {
							const treatmentDate = new Date(date);
							if (treatmentDate >= start && treatmentDate <= end) {
								acc[patientId].add(
									treatmentDate.toISOString().split("T")[0] + "T00:00:00.000Z"
								);
							}
						});

						return acc;
					},
					{}
				);

				const totalLotDays = Object.values(patientPrescriptions).reduce(
					(total, dates) => total + dates.size,
					0
				);

				const totalDays =
					Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

				const uniquePatients = new Set(
					prescriptions.map((prescription) => prescription.patientName)
				).size;

				const finalLot =
					uniquePatients > 0
						? (totalLotDays / (totalDays * uniquePatients)) * 100
						: 0;

				const lotFormatted = finalLot.toFixed(3);

				return reply.status(200).send({
					success: true,
					errors: null,
					data: { lot: Number(lotFormatted) },
				});
			}
		);
}
