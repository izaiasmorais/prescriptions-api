import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { BadRequestError } from "./http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "./http/routes/_errors/unathorized-error";

type FastifiErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifiErrorHandler = async (error, _, reply) => {
	if (error instanceof ZodError) {
		return reply.status(400).send({
			message: "Validation error",
			errors: error.flatten().fieldErrors,
		});
	}

	if (error instanceof BadRequestError) {
		return reply.status(400).send({
			message: error.message,
		});
	}

	if (error instanceof UnauthorizedError) {
		return reply.status(401).send({
			message: error.message,
		});
	}

	return reply.status(500).send({ message: "Internal server error." });
};
