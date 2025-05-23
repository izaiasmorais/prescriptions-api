import { z } from "zod";

export const prescriptionSchema = z.object({
	id: z.string(),
	medicalRecord: z.string(),
	patientName: z.string(),
	medicine: z.string(),
	unit: z.string(),
	dose: z.string(),
	via: z.string(),
	posology: z.string(),
	treatmentDays: z.array(z.coerce.date()),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date().nullable(),
});

export const getPrescriptionsResponseSchema = z.object({
	prescriptions: z.array(prescriptionSchema),
	meta: z.object({
		page: z.number(),
		itemsPerPage: z.number(),
		totalItems: z.number(),
		totalPages: z.number(),
	}),
});

export const prescriptionRequestSchema = z.object({
	medicalRecord: z.string().min(1, "O Número do prontuário é obrigatório"),
	patientName: z.string().min(1, "O Nome do paciente é obrigatório"),
	unit: z.string().min(1, "A Unidade é obrigatória"),
	medicine: z.string().min(1, "O Medicamento é obrigatório"),
	via: z.string().min(1, "A Via de administração é obrigatória"),
	dose: z.string().min(1, "A Dose é obrigatória"),
	posology: z.string().min(1, "A Posologia é obrigatória"),
	treatmentDays: z
		.array(z.coerce.date())
		.min(1, "Defina os dias de tratamento"),
});

export type PrescriptionRequest = z.infer<typeof prescriptionRequestSchema>;

export const getPrescriptionsQuerySchema = z.object({
	id: z.string().uuid().nullable().optional(),
	pageIndex: z.coerce.number().int().nonnegative().optional(),
	perPage: z.coerce.number().int().positive().optional(),
	medicalRecord: z.string().nullable().optional(),
	patientName: z.string().nullable().optional(),
	medicine: z.string().nullable().optional(),
	unit: z.string().nullable().optional(),
	dose: z.string().nullable().optional(),
	posology: z.string().nullable().optional(),
});
