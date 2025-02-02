import { ZodError } from "zod";
import { BadRequestError } from "./controllers/_errors/bad-request-error";
import { UnauthorizedError } from "./controllers/_errors/unauthorized-error";
import { FastifyInstance } from "fastify";

type FastifiErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifiErrorHandler = async (error, _, reply) => {
	console.log(error);

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

	return reply.status(500).send({ message: error.message });
};
