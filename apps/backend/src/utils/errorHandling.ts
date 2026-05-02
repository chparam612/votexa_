export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleControllerError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError(500, error.message);
  }
  return new AppError(500, 'Unknown error occurred');
};
