export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "CONFLICT", message);
    this.name = "ConflictError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, "VALIDATION_ERROR", message);
    this.name = "ValidationError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    statusCode: number,
    message: string,
    code = "EXTERNAL_SERVICE_ERROR",
  ) {
    super(statusCode, code, message);
    this.name = "ExternalServiceError";
  }
}
