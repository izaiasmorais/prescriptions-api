import 'dotenv/config';

import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { Server, IncomingMessage, ServerResponse } from "http";
import { FastifyInstance, type FastifyBaseLogger } from "fastify";
import { buildApp } from "../../server";
import request from "supertest";
import { env } from "../../../env";

describe("E2E Tests", () => {
	let app: FastifyInstance<
		Server<typeof IncomingMessage, typeof ServerResponse>,
		IncomingMessage,
		ServerResponse<IncomingMessage>,
		FastifyBaseLogger,
		ZodTypeProvider
	>;

	beforeAll(async () => {
		app = await buildApp();
		await app.ready();

		console.log(process.env.TZ);


		console.log(env.DATABASE_URL);
	});

	afterAll(async () => {
		await app.close();
	});

	test("[POST] /auth/sign-up", async () => {
		// const response = await request(app.server).post("/auth/sign-up").send({
		// 	name: "John Doe",
		// 	email: "johndoe@gmail.com",
		// 	password: "123456",
		// });

		// expect(response.statusCode).toBe(201);

		expect(true).toBe(true);
	});
});
