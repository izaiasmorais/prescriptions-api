import { buildApp } from "./server";
import { env } from "../env";

const start = async () => {
	const app = await buildApp();

	try {
		await app.listen({ port: Number(env.PORT), host: "0.0.0.0" });
		console.log(`HTTP server running at PORT ${env.PORT}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
