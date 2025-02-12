export interface HTTPResponse<T> {
	success: boolean;
	error: string | null;
	data: T;
}
