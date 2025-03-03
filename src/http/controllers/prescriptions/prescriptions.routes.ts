import type { FastifyInstance } from "fastify";
import { getPrescriptions } from "./get-prescriptions";
import { createPrescription } from "./create-prescription";
import { deletePrescription } from "./delete-prescription";
import { editPrescription } from "./edit-prescription";

export async function prescriptionsRoutes(app: FastifyInstance) {
	app.register(getPrescriptions);
	app.register(createPrescription);
	app.register(deletePrescription);
	app.register(editPrescription);
}
