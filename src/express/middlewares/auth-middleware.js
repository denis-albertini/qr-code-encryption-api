import CustomError from '../../models/custom-error.js';
import { JWTExpiredError, JWTService } from '../../services/jwt-service.js';

const jwtService = new JWTService(process.env.JWT_SECRET);

function createAuthMiddleware(purpose, ...acceptedRoles) {
  return async (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new CustomError(
        'Credenciais inválidas.',
        401,
        'Credenciais ausentes'
      );
    }

    let payload;

    try {
      payload = await jwtService.verify(token);
    } catch (error) {
      const message = error.message;
      const status = error instanceof JWTExpiredError ? 403 : 500;
      const errors = error.errors;

      throw new CustomError(message, status, ...errors);
    }

    if (
      payload.purpose !== purpose ||
      (acceptedRoles.length > 0 && !acceptedRoles.includes(payload.role))
    ) {
      throw new CustomError('Acesso proibido.', 403);
    }

    next();
  };
}

export const userAuthMiddleware = createAuthMiddleware('ACCESS', 'USER');
export const adminAuthMiddleware = createAuthMiddleware('ACCESS', 'ADMIN');
