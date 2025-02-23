import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyJwt from "@fastify/jwt";
import fastifySwaggerUI from "@fastify/swagger-ui";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider,
} from "fastify-type-provider-zod";
import { signUp } from "./controllers/auth/sign-up";
import { signIn } from "./controllers/auth/sign-in";
import { deleteAccount } from "./controllers/auth/delete-account";
import { getPrescriptions } from "./controllers/prescriptions/get-prescriptions";
import { createPrescription } from "./controllers/prescriptions/create-prescription";
import { getProfile } from "./controllers/auth/get-profile";
import { deletePrescription } from "./controllers/prescriptions/delete-prescription";
import { editPrescription } from "./controllers/prescriptions/edit-prescription";
import { errorHandler } from "./error-handler";
import { env } from "../env";

const port = Number(env.PORT);

export const app = fastify().withTypeProvider<ZodTypeProvider>();

// Configurações de validação e serialização
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Middleware de tratamento de erros
app.setErrorHandler(errorHandler);

// Plugins
app.register(fastifyCors);
app.register(fastifySwagger, {
	openapi: {
		info: {
			title: "prescriptions api",
			description: "An API to manage prescriptions in a medical system.",
			version: "1.0.0",
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
	},
	transform: jsonSchemaTransform,
});
app.register(fastifySwaggerUI, {
	routePrefix: "/",
});
app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
});

// Roas de Autenticação
app.register(signUp);
app.register(signIn);
app.register(getProfile);
app.register(deleteAccount);

// Rotas de Prescrições
app.register(getPrescriptions);
app.register(createPrescription);
app.register(deletePrescription);
app.register(editPrescription);

try {
	app.listen({ port, host: "0.0.0.0" });
	console.log(`HTTP server running at PORT ${env.PORT}`);
} catch (err) {
	app.log.error(err);
	process.exit(1);
}
