import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import CustomError from '../../models/custom-error.js';

const jwtAsyncVerify = promisify(jwt.verify);

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
      payload = await jwtAsyncVerify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new CustomError(
        'Falha ao verificar token JWT.',
        500,
        error.message
      );
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
