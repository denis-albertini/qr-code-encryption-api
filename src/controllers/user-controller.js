import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UniqueConstraintError, Op } from 'sequelize';
import { promisify } from 'util';
import database from '../database.js';
import emailService from '../email-service.js';
import CustomError from '../models/custom-error.js';
import User from '../models/user.js';

const cryptoAsyncGenerateKeyPair = promisify(crypto.generateKeyPair);

const jwtAsyncSign = promisify(jwt.sign);
const jwtAsyncVerify = promisify(jwt.verify);

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
      throw new CustomError('Falha ao gerar chaves RSA.', 500, error.message);
    }

    try {
      await database.startTransaction();

      const user = await User.create(
        { ...req.body, privateKey, publicKey },
        { transaction: database.transaction }
      );

      const token = await jwtAsyncSign(
        { id: user.id, purpose: 'EMAIL_CONFIRMATION' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      await emailService.sendAccountConfirmation(user.id, user.email, token);

      await database.commitTransaction();
    } catch (error) {
      await database.rollbackTransaction();

      if (error instanceof UniqueConstraintError) {
        throw error;
      }

      throw new CustomError(
        'Falha ao criar conta de usuário.',
        500,
        error.message
      );
    }

    res.sendStatus(201);
  };

  activateAccount = async (req, res) => {
    const userId = req.params.id;
    const { token } = req.query;

    let payload;

    try {
      payload = await jwtAsyncVerify(token, process.env.JWT_SECRET);
    } catch (error) {
      let message,
        status,
        errors = [];

      if (error instanceof jwt.TokenExpiredError) {
        message = 'Token expirado.';
        status = 400;
      } else {
        message = 'Falha ao verificar token de confirmação de e-mail.';
        status = 500;
        errors.push(error.message);
      }

      throw new CustomError(message, status, errors);
    }

    if (payload.id !== userId || payload.purpose !== 'EMAIL_CONFIRMATION') {
      throw new CustomError('Token inválido.', 400);
    }

    const user = await User.findByPk(userId);

    if (!user || user.status !== 'PENDING') {
      throw new CustomError('Conta de usuário não está pendente.', 400);
    }

    user.status = 'ACTIVE';

    await user.save();

    // Redireciona para a URI personalizada do app após ativação bem-sucedida
    res.redirect(302, 'qrypt://account-created-message');
  };

  login = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      throw new CustomError(
        'Credenciais inválidas.',
        400,
        'Identificador ou senha ausente'
      );
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user || user.status === 'PENDING') {
      throw new CustomError('Usuário não existe.', 404);
    }

    let checksOut;

    try {
      checksOut = await bcrypt.compare(password, user.password);
    } catch (error) {
      throw new CustomError(
        'Falha ao comparar senhas no login.',
        500,
        error.message
      );
    }

    if (!checksOut) {
      throw new CustomError(
        'Credenciais inválidas.',
        401,
        'Senha não corresponde'
      );
    }

    let token;

    try {
      token = await jwtAsyncSign(
        { id: user.id, purpose: 'ACCESS', role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (error) {
      throw new CustomError(
        'Falha ao assinar token de login.',
        500,
        error.message
      );
    }

    res.status(200).send({ token });
  };
}
