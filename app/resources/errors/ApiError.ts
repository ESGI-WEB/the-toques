class ApiError extends Error {
    public status?: number;
    public data?: any;

    constructor(message?: string, data?: any, status?: number) {
        super(message);
        this.status = status;
        this.data = data;
    }
}