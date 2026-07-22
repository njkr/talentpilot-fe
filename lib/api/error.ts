export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>,
    public fields?: Record<string, string[]>, // VALIDATION_FAILED → field → messages
    public requestId?: string, // for support: "give us this ID"
  ) {
    super(message);
    this.name = "ApiError";
  }
}
