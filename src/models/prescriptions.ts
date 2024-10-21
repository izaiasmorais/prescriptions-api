export interface Prescription {
	id: string;
	medicalRecord: string;
	name: string;
	medicine: string;
	unit: string;
	dose: number;
	via: string;
	posology: string;
	posologyDays: string[];
}

export interface GetPrescriptionsQueryParams {
	pageIndex?: number;
	perPage?: number;
	id?: string | null;
	medicalRecord?: string | null;
	name?: string | null;
	medicine?: string | null;
	unit?: string | null;
	dose?: number | null;
	posology?: string | null;
	posologyDays?: string[] | null;
}
