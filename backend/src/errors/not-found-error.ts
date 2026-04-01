import ApiError from './api-error';

class NotFoundError extends ApiError {
  constructor(message: string = 'Not Found') {
    super(message, 404, 'NotFoundError');
  }
}

export default NotFoundError;
