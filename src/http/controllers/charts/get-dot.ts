import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { verifyJwt } from "../../middlewares/auth.js";
import {
	errorResponseSchema,
	successResponseSchema,
} from "../../schemas/http.js";
import {
	getDotChartRequestQuerySchema,
	getDotChartResponseSchema,
} from "http/schemas/charts.js";

export async function getDot(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/charts/dot",
		{
			onRequest: [verifyJwt],
			schema: {
				tags: ["charts"],
				operationId: "getDotChart",
				summary: "Obtém o gráfico de DOT",
				security: [{ bearerAuth: [] }],
				querystring: getDotChartRequestQuerySchema,
				response: {
					200: successResponseSchema(getDotChartResponseSchema).describe("OK"),
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

			const dot = Object.values(groupedPrescriptions).reduce(
				(total, dates) => total + dates.size,
				0
			);

			const totalDays =
				Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

			const uniquePatients = new Set(
				prescriptions.map((prescription) => prescription.patientName)
			).size;

			const finalDot =
				uniquePatients > 0 ? (dot / (totalDays * uniquePatients)) * 100 : 0;

			const dotFormatted = finalDot.toFixed(3);

			return reply.status(200).send({
				success: true,
				errors: null,
				data: { dot: Number(dotFormatted) },
			});
		}
	);
}
