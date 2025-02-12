import { z } from "zod";

export const defaultSuccessResponseSchema = <T extends z.ZodTypeAny>(
	dataSchema?: T
) =>
	z.object({
		success: z.literal(true),
		error: z.null(),
		data: dataSchema ?? z.null(),
	}).describe("Success")

export const defaultErrorResponseSchema = z.object({
	success: z.literal(false),
	error: z.string(),
	data: z.null(),
});
