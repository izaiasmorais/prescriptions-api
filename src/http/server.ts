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
import { signUp } from "./routes/auth/sign-up";
import { signIn } from "./routes/auth/sign-in";
import { deleteAccount } from "./routes/auth/delete-account";
import { getPrescriptions } from "./routes/prescriptions/get-prescriptions";
import { createPrescription } from "./routes/prescriptions/create-prescription";
import { getProfile } from "./routes/auth/get-profile";
import { deletePrescription } from "./routes/prescriptions/delete-prescription";
import { editPrescription } from "./routes/prescriptions/edit-prescription";
import { errorHandler } from "./error-handler";
import { env } from "../env";
import { prisma } from "../libs/prisma";

const port = Number(env.PORT);

const app = fastify().withTypeProvider<ZodTypeProvider>();

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
			description:
				"An API to manage prescriptions and users in a medical system.",
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
	routePrefix: "/docs",
});
app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
});

// Registra o Prisma no contexto do Fastify
app.decorate("prisma", prisma);

// Rotas
app.get("/", async () => {
	return { message: "Hello World" };
});

// Autenticação
app.register(signUp);
app.register(signIn);
app.register(getProfile);
app.register(deleteAccount);

// Prescrições
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
