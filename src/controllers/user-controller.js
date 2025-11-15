import bcrypt from 'bcryptjs';
import { UniqueConstraintError } from 'sequelize';
import database from '../database.js';
import CustomError from '../models/custom-error.js';
import User from '../models/user.js';
import { CryptoService } from '../services/crypto-service.js';
import { EmailError, EmailService } from '../services/email-service.js';
import {
  JWTError,
  JWTExpiredError,
  JWTService,
} from '../services/jwt-service.js';

export default class UserController {
  #cryptoService;
  #emailService;
  #jwtService;

  constructor() {
    this.#cryptoService = new CryptoService();
    this.#emailService = new EmailService(
      process.env.EMAIL_HOST,
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS
    );
    this.#jwtService = new JWTService(process.env.JWT_SECRET);
  }

  createUser = async (req, res) => {
    let privateKey, publicKey;

    try {
      const keys = await this.#cryptoService.generateRSAKeys();

      privateKey = keys.privateKey;
      publicKey = keys.publicKey;
    } catch (error) {
      throw new CustomError(error.message, 500, ...error.errors);
    }

    try {
      await database.startTransaction();

      const user = await User.create(
        { ...req.body, privateKey, publicKey },
        { transaction: database.transaction }
      );

      const token = await this.#jwtService.sign(
        { id: user.id, purpose: 'EMAIL_CONFIRMATION' },
        { expiresIn: '1d' }
      );

      await this.#emailService.sendAccountConfirmation(
        user.id,
        user.email,
        token,
        emailHtml,
        'QR Code Encryption App'
      );

      await database.commitTransaction();
    } catch (error) {
      await database.rollbackTransaction();

      if (error instanceof UniqueConstraintError) {
        throw error;
      }

      let message,
        errors = [];

      if (error instanceof JWTError || error instanceof EmailError) {
        message = error.message;
        errors.push(...error.errors);
      } else {
        message = 'Failed to create user account.';
        errors.push(error.message);
      }

      throw new CustomError(message, 500, ...errors);
    }

    res.sendStatus(201);
  };

  activateAccount = async (req, res) => {
    const userId = req.params.id;
    const { token } = req.query;

    let payload;

    try {
      payload = await this.#jwtService.verify(token);
    } catch (error) {
      const message = error.message;
      const status = error instanceof JWTExpiredError ? 400 : 500;
      const errors = error.errors;

      throw new CustomError(message, status, ...errors);
    }

    if (payload.id !== userId || payload.purpose !== 'EMAIL_CONFIRMATION') {
      throw new CustomError('Forbidden.', 403, 'Invalid token');
    }

    const user = await User.findByPk(userId);

    if (!user || user.status !== 'PENDING') {
      throw new CustomError('User account is not pending.', 400);
    }

    user.status = 'ACTIVE';

    await user.save();

    res.sendStatus(204);
  };

  login = async (req, res) => {
    const { username, email, password } = req.body;

    let user;

    if (username) {
      user = await User.findOne({ where: { username } });
    } else if (email) {
      user = await User.findOne({ where: { email } });
    }

    if (!user || user.status === 'PENDING') {
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
      token = await this.#jwtService.sign(
        { id: user.id, purpose: 'ACCESS', role: user.role },
        { expiresIn: '7d' }
      );
    } catch (error) {
      throw new CustomError(error.message, 500, ...error.errors);
    }

    res.status(200).send({ token });
  };
}

const emailHtml = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmação de Conta</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              padding: 20px 0;
              background-color: #2c3e50;
              color: white;
              border-radius: 8px 8px 0 0;
          }
          .content {
              padding: 30px 20px;
              text-align: center;
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #3498db;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
          }
          .footer {
              text-align: center;
              padding: 20px;
              color: #7f8c8d;
              font-size: 12px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Assinatura Digital QR</h1>
          </div>
          
          <div class="content">
              <h2>Confirmação de Conta</h2>
              <p>Olá,</p>
              <p>Obrigado por criar uma conta em nosso aplicativo de QR Codes Digitalmente Assinados!</p>
              <p>Para ativar sua conta, clique no botão abaixo:</p>
              
              <a href="{{confirmationUrl}}" class="button">Confirmar Minha Conta</a>
              
              <p>Este link expirará em 24 horas por motivos de segurança.</p>
          </div>
          
          <div class="footer">
              <p>Se você não criou esta conta, por favor ignore este email.</p>
          </div>
      </div>
  </body>
  </html>
`;
