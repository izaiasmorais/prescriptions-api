import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../libs/prisma.js";
import { auth, verifyJwt } from "../../middlewares/auth.js";
import {
	defaultErrorResponseSchema,
	defaultSuccessResponseSchema,
} from "../../schemas/response";
import {
	getPrescriptionsQuerySchema,
	getPrescriptionsResponseBodySchema,
} from "../../schemas/prescription";
import { z } from "zod";

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
					querystring: getPrescriptionsQuerySchema,
					response: {
						200: defaultSuccessResponseSchema(z.any()).describe("OK"),
						401: defaultErrorResponseSchema.describe("Unauthorized"),
					},
				},
			},
			async (request, reply) => {}
		);
}
