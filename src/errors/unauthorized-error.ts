interface HTTPResponse<T> {
	success: boolean;
	error: string | null;
	data: T;
}

export class UnauthorizedError<T> implements HTTPResponse<T> {
	success: boolean;
	error: string | null;
	data: T;

	constructor(message: string = "Unauthorized", data: T = null as T) {
		this.success = false;
		this.error = message;
		this.data = data;
	}
}
