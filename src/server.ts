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
import { deleteUser } from "./http/routes/users/delete-user";
import { getUsers } from "./http/routes/users/get-users";
import { getPrescriptions } from "./http/routes/prescriptions/get-prescriptions";
import { createPrescription } from "./http/routes/prescriptions/create-prescription";
import { getProfile } from "./http/routes/users/get-profile";

const port = process.env.PORT || 3333;

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
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
	secret: "secret",
});

app.get("/", async () => {
	return { message: "Hello World" };
});

// auth
app.register(signUp);
app.register(signIn);

// user
app.register(getUsers);
app.register(deleteUser);
app.register(getProfile);

// prescriptions
app.register(getPrescriptions);
app.register(createPrescription);

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
