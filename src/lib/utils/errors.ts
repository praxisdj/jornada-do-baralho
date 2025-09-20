import { ZodIssue } from "zod";

export class AppError extends Error {
  statusCode: number;
  isCriticalError: boolean;
  meta?: unknown;

  constructor(
    statusCode: number,
    message: string,
    isCriticalError: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isCriticalError = isCriticalError;

    // ✨ Important to preserve subclass name
    this.name = new.target.name;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(
    message = "Bad Request",
    isCriticalError: boolean = false,
    meta?: unknown,
  ) {
    super(400, message, isCriticalError);
    this.meta = meta;
  }
}

export class ValidationError extends AppError {
  validationErrors: ZodIssue[];

  constructor(
    validationErrors: ZodIssue[],
    isCriticalError: boolean = false,
    meta?: unknown,
  ) {
    super(400, "Validation Error", isCriticalError);
    this.validationErrors = validationErrors;
    this.meta = meta;
  }
}

export class NotFoundError extends AppError {
  constructor(
    message = "Not Found",
    isCriticalError: boolean = false,
    meta?: unknown,
  ) {
    super(404, message, isCriticalError);
    this.meta = meta;
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = "Unauthorized",
    isCriticalError: boolean = false,
    meta?: unknown,
  ) {
    super(401, message, isCriticalError);
    this.meta = meta;
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = "Forbidden",
    isCriticalError: boolean = false,
    meta?: unknown,
  ) {
    super(403, message, isCriticalError);
    this.meta = meta;
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = "Internal Server Error",
    isCriticalError: boolean = true,
    meta?: unknown,
  ) {
    super(500, message, isCriticalError);
    this.meta = meta;
  }
}

export class DatabaseError extends AppError {
  constructor(
    message = "Database Error",
    isCriticalError: boolean = true,
    meta?: unknown,
  ) {
    super(500, message, isCriticalError);
    this.meta = meta;
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message = "External Service Error",
    isCriticalError: boolean = true,
    meta?: unknown,
  ) {
    super(502, message, isCriticalError);
    this.meta = meta;
  }
}

export class EnvConfigurationError extends AppError {
  constructor(
    message = "Environment Configuration Error",
    isCriticalError: boolean = true,
    meta?: unknown,
  ) {
    super(500, message, isCriticalError);
    this.meta = meta;
  }
}
