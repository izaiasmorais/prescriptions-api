import fastify from "fastify";
import { getUsers } from "./http/routes/get-users";
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
import { signUp } from "./http/routes/sign-up";
import { deleteUser } from "./http/routes/delete-user";
import { env } from "./env";
import { signIn } from "./http/routes/sign-in";

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
				"An API to manage prescriptions and users in a medical system",
			version: "1.0.0",
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
app.register(getUsers);
app.register(deleteUser);
app.register(signUp);
app.register(signIn);

const start = async () => {
	try {
		await app.listen({ port: Number(port), host: "0.0.0.0" });
		app.log.info(`Server listening on port ${port}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
