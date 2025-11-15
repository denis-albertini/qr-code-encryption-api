import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const { sign, verify, TokenExpiredError } = jwt;

const signAsync = promisify(sign);
const verifyAsync = promisify(verify);

export class JWTError extends Error {
  constructor(message, ...errors) {
    super(message);
    this.errors = errors;
    this.name = 'JWTError';
  }
}

export class JWTExpiredError extends JWTError {
  constructor() {
    super('Token expired.');
    this.name = 'JWTExpiredError';
  }
}

export class JWTService {
  #secret;

  constructor(secret) {
    this.#secret = secret;
  }

  async sign(payload, options) {
    try {
      return await signAsync(payload, this.#secret, options);
    } catch (error) {
      throw new JWTError('Failed to sign token.', error.message);
    }
  }

  async verify(token) {
    try {
      return await verifyAsync(token, this.#secret);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new JWTExpiredError();
      }

      throw new JWTError('Failed to verify token.', error.message);
    }
  }
}
