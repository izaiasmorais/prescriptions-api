import { ZodError } from "zod";
import { UnauthorizedError } from "./controllers/_errors/unauthorized-error";
import { FastifyInstance } from "fastify";

type FastifiErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifiErrorHandler = async (error, _, reply) => {
	if (error instanceof ZodError) {
		return reply.status(400).send({
			success: false,
			error: error.errors[0].message,
			data: null,
		});
	}

	if (error instanceof UnauthorizedError) {
		return reply.status(401).send({
			success: error.success,
			error: error.error,
			data: error.data,
		});
	}

	if (error.code === "FST_ERR_VALIDATION" && Array.isArray(error.validation)) {
		return reply.status(400).send({
			success: false,
			error: error.validation[0].message,
			data: null,
		});
	}

	return reply.status(500).send({
		success: false,
		error: "Internal server error",
		data: null,
	});
};
