import CustomError from '../../models/custom-error.js';

export const errorHandlingMiddleware = (err, _req, res, _next) => {
  let customError = err;

  if (!err.status) {
    let message, status, errors;

    switch (err.constructor.name) {
      case 'ValidationError':
        message = 'Erro de validação.';
        status = 400;
        errors = err.errors.map(e => e.message);
        break;
      case 'UniqueConstraintError':
        message = 'Conflitos de valores únicos.';
        status = 409;
        const fields = Array.from(
          new Set((err.errors || []).map(e => e.path).filter(Boolean))
        );
        errors = fields.map(f => {
          switch (f) {
            case 'username':
              return 'Nome de usuário já está em uso.';
            case 'email':
              return 'E-mail já está em uso.';
            default:
              return `Valor único já existe para ${f}.`;
          }
        });
        if (errors.length === 0) {
          errors = ['Valor único já existe para campo desconhecido.'];
        }
        break;
      default:
        message = 'Erro interno do servidor.';
        status = 500;
        errors = ['Consulte o console'];
        console.error(err);
        break;
    }

    customError = new CustomError(message, status, ...errors);
  }

  res
    .status(customError.status)
    .send({ message: customError.message, errors: customError.errors });
};
