import { z } from "zod";

export const signUpRequestSchema = z.object({
	name: z.string().min(5, "O Nome é obrigatório"),
	email: z.string().email("Email inválido"),
	password: z.string().min(6, "A senha deve conter pelo menos 6 caracteres"),
});

export const signInRequestSchema = z.object({
	email: z.string().email("Email inválido"),
	password: z.string().min(6, "A senha deve conter pelo menos 6 caracteres"),
});

export const signInResponseSchema = z.object({
	accessToken: z.string().jwt(),
});

export const getProfileResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().email(),
});

export const resetPasswordRequestSchema = z
	.object({
		password: z.string().min(6, "A senha deve conter pelo menos 6 caracteres"),
		new_password: z
			.string()
			.min(6, "A nova senha deve conter pelo menos 6 caracteres"),
	})
	.refine((data) => data.password !== data.new_password, {
		message: "A nova senha deve ser diferente da atual",
	});
