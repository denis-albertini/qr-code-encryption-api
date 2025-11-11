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
        const conflicts = err.message
          .match(/"([^"]*)"/)
          .map(str => str.slice(1, -1))[0]
          .split('_');
        conflicts.pop();
        errors = [`Unique value already exists for ${conflicts.join('_')}`];
        break;
      default:
        message = 'Internal server error.';
        status = 500;
        errors = ['Refer to console'];
        console.error(err);
        break;
    }

    customError = new CustomError(message, status, ...errors);
  }

  res
    .status(customError.status)
    .send({ message: customError.message, errors: customError.errors });
};
