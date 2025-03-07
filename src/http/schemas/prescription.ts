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
});

export const getPrescriptionsResponseBodySchema = z.object({
	prescriptions: z.array(prescriptionSchema),
	meta: z.object({
		pageIndex: z.number(),
		perPage: z.number(),
		totalCount: z.number(),
	}),
});

export const prescriptionsRequestBodySchema = z.object({
	medicalRecord: z.string().min(1, "O Número do prontuário é obrigatório"),
	patientName: z.string().min(1, "O Nome do paciente é obrigatório"),
	unit: z.string().min(1, "A Unidade é obrigatória"),
	medicine: z.string().min(1, "O Medicamento é obrigatório"),
	via: z.string().min(1, "A Via de administração é obrigatória"),
	dose: z.string().min(1, "A Dose é obrigatória"),
	posology: z.string().min(1, "A Posologia é obrigatória"),
	treatmentDays: z.array(z.coerce.date()).min(1, "Defina os dias de tratamento"),
});

export type PrescriptionBody = z.infer<typeof prescriptionsRequestBodySchema>;

export const getPrescriptionsQuerySchema = z.object({
	pageIndex: z.coerce.number().int().nonnegative().optional(),
	perPage: z.coerce.number().int().positive().optional(),

	id: z.string().nullable().optional(),
	medicalRecord: z.string().nullable().optional(),
	patientName: z.string().nullable().optional(),
	medicine: z.string().nullable().optional(),
	unit: z.string().nullable().optional(),
	dose: z.string().nullable().optional(),
	posology: z.string().nullable().optional(),
});
