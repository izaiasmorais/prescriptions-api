import { app } from "../../server.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

describe("Sign In (E2E)", () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	it("[POST] /auth/sign-up", async () => {
		await request(app.server).post("/auth/sign-up").send({
			name: "John Doe",
			email: "johndoe@example.com",
			password: "000000",
		});

		const response = await request(app.server).post("/auth/sign-in").send({
			email: "johndoe@example.com",
			password: "000000",
		});

		expect(response.statusCode).toEqual(201);
		expect(response.body).toEqual({
			token: expect.any(String),
		});
	});
});
