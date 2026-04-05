import ApiError from './api-error';

class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UnauthorizedError');
  }
}

export default UnauthorizedError;
