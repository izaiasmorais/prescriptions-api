import { ZodError } from "zod";
import { FastifyInstance } from "fastify";

type FastifiErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifiErrorHandler = async (error, _, reply) => {
	console.log(error);

	if (error instanceof ZodError) {
		return reply.status(400).send({
			success: false,
			error: error.errors[0].message,
			data: null,
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
		error: "Erro interno no servidor",
		data: null,
	});
};
