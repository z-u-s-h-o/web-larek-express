import ApiError from './api-error';

class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request') {
    super(message, 400, 'BadRequestError');
  }
}

export default BadRequestError;
