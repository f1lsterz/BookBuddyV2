export class ApiError extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }

  static BadRequest(message: string) {
    return new ApiError(400, message);
  }

  static NotFound(message: string) {
    return new ApiError(404, message);
  }

  static InternalServerError(message: string) {
    return new ApiError(500, message);
  }

  static Unauthorized(message: string) {
    return new ApiError(401, message);
  }

  static Forbidden(message: string) {
    return new ApiError(403, message);
  }

  static RequestTimeout(message: string) {
    return new ApiError(408, message);
  }
}
