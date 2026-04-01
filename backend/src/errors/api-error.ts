abstract class ApiError extends Error {
  public readonly statusCode: number;

  public readonly name: string;

  constructor(message: string, statusCode: number, name: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
