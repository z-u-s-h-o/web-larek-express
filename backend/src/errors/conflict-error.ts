import ApiError from './api-error';

class ConflictError extends ApiError {
  constructor(message: string = 'Conflict') {
    super(message, 409, 'ConflictError');
  }
}

export default ConflictError;
