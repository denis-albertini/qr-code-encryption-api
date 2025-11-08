import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import CustomError from '../models/custom-error.js';
import User from '../models/user.js';

const cryptoAsyncGenerateKeyPair = promisify(crypto.generateKeyPair);

const jwtAsyncSign = promisify(jwt.sign);

export default class UserController {
  createUser = async (req, res) => {
    let privateKey, publicKey;

    try {
      const keys = await cryptoAsyncGenerateKeyPair('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });

      privateKey = keys.privateKey;
      publicKey = keys.publicKey;
    } catch (error) {
      throw new CustomError('Failed to generate RSA keys.', 500, error.message);
    }

    await User.create({ ...req.body, privateKey, publicKey });

    res.sendStatus(201);
  };

  login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new CustomError('User does not exist.', 404);
    }

    let checksOut;

    try {
      checksOut = await bcrypt.compare(password, user.password);
    } catch (error) {
      throw new CustomError(
        'Failed to compare passwords on login.',
        500,
        error.message
      );
    }

    if (!checksOut) {
      throw new CustomError(
        'Invalid credentials.',
        401,
        'Password does not match'
      );
    }

    let token;

    try {
      token = await jwtAsyncSign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (error) {
      throw new CustomError('Failed to sign login token.', 500, error.message);
    }

    res.status(200).send({ token });
  };
}
