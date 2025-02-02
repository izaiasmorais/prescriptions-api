import { app } from "../../server.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

describe("Sign Up (E2E)", () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	it("[POST] /auth/sign-up", async () => {
		const response = await request(app.server).post("/auth/sign-up").send({
			name: "John Doe",
			email: "johndoe@example.com",
			password: "000000",
		});

		expect(response.statusCode).toEqual(201);
	});
});
