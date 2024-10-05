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
import { env } from "./env";
import { signUp } from "./http/routes/auth/sign-up";
import { signIn } from "./http/routes/auth/sign-in";
import { deleteAccount } from "./http/routes/auth/delete-account";
import { getPrescriptions } from "./http/routes/prescriptions/get-prescriptions";
import { createPrescription } from "./http/routes/prescriptions/create-prescription";
import { getProfile } from "./http/routes/auth/get-profile";
import { errorHandler } from "./error-handler";
import { deletePrescription } from "./http/routes/prescriptions/delete-prescription";
import { editPrescription } from "./http/routes/prescriptions/edit-prescription";

const port = env.PORT;

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(errorHandler);
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

app.get("/", async () => {
	return { message: "Hello World" };
});

// auth
app.register(signUp);
app.register(signIn);
app.register(getProfile);
app.register(deleteAccount);

// prescriptions
app.register(getPrescriptions);
app.register(createPrescription);
app.register(deletePrescription);
app.register(editPrescription);

const start = async () => {
	try {
		await app.listen({ port: Number(port), host: "0.0.0.0" });
		console.log(`Server listening on port ${port}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
