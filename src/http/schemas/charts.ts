import { z } from "zod";

export const getDotRequestSchema = z.object({
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
	unit: z.string().nullable(),
});

export const getLotChartRequestQuerySchema = z.object({
	unit: z.string(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
});

export const getLotChartResponseSchema = z.object({
	lot: z.number(),
});

export const getDotChartRequestQuerySchema = z.object({
	unit: z.string(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
});

export const getDotChartResponseSchema = z.object({
	dot: z.number(),
});
