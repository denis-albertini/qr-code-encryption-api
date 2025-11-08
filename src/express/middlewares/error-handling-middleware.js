import CustomError from '../../models/custom-error.js';

export const errorHandlingMiddleware = (err, _req, res, _next) => {
  let customError = err;

  if (!err.status) {
    let message, status, errors;

    switch (err.constructor.name) {
      case 'ValidationError':
        message = 'Validation error.';
        status = 400;
        errors = err.errors.map(e => e.message);
        break;
      case 'UniqueConstraintError':
        message = 'Unique constraint error.';
        status = 409;
        errors = [err.message];
        break;
      case 'ForeignKeyConstraintError':
        message = 'Foreign key constraint error.';
        status = 409;
        errors = [err.message];
        break;
      default:
        message = 'Internal server error.';
        status = 500;
        errors = [err.message || 'Refer to console'];
    }

    customError = new CustomError(message, status, ...errors);
  }

  res
    .status(customError.status)
    .send({ message: customError.message, errors: customError.errors });
};
