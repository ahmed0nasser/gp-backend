interface ErrorResponse {
  message: string;
  details?: string;
}

class APIError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errRes: ErrorResponse
  ) {
    super(errRes.message);
  }
}

export default APIError;
