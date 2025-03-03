import { z } from "zod";


export const getDotRequestBodySchema =  z.object({
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
	
	unit: z.string().nullable(),
})
