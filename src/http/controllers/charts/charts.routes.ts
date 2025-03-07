import type { FastifyInstance } from "fastify";
import { getDotChart } from "./get-dot";

export async function chartsRoutes(app: FastifyInstance) {
	app.register(getDotChart);
}
