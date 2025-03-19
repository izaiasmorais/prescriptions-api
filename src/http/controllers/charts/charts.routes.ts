import type { FastifyInstance } from "fastify";
import { getDot } from "./get-dot";
import { getLot } from "./get-lot";

export async function chartsRoutes(app: FastifyInstance) {
	app.register(getDot);
	app.register(getLot);
}
