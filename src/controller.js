import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { toDataURL as createQRCodeURl } from 'qrcode';
import { promisify } from 'util';
import CustomError from './custom-error.js';
import QRCode from './models/qr-code.js';
import User from './models/user.js';

const cryptoAsyncGenerateKeyPair = promisify(crypto.generateKeyPair);
const cryptoAsyncSign = promisify(crypto.sign);

const jwtAsyncSign = promisify(jwt.sign);

export default class Controller {
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

    await User.create({ ...req.body, role: 'USER', privateKey, publicKey });

    res.sendStatus(201);
  };

  login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: email });

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

  generateQRCode = async (req, res) => {
    const { userId, content } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new CustomError('User does not exist.', 404);
    }

    const qrCode = QRCode.build({ userId, content });

    const payload = {
      userId,
      content,
      id: qrCode.id,
      createdAt: qrCode.createdAt,
    };

    let signature;

    try {
      signature = (
        await cryptoAsyncSign('sha256', Buffer.from(payload), user.privateKey)
      ).toString('base64');
    } catch (error) {
      throw new CustomError('Failed to sign payload.', 500, error.message);
    }

    qrCode.signature = signature;
    payload.signature = signature;

    let qrCodeUrl;

    try {
      qrCodeUrl = await createQRCodeURl(JSON.stringify(payload));
    } catch (error) {
      throw new CustomError(
        'Failed to create the QR code URL.',
        500,
        error.message
      );
    }

    await qrCode.save();

    res.status(201).send({ qrCodeUrl });
  };

  verifyQRCode = async (req, res) => {
    const { qrCodeData } = req.body;

    let payload;

    try {
      payload = JSON.parse(qrCodeData);
    } catch (error) {
      throw new CustomError(
        'Failed to recover payload from QR code data.',
        500,
        error.message
      );
    }

    const errors = [];

    const qrCode = await QRCode.findByPk(payload.qrCodeId);

    if (!qrCode) {
      errors.push('QR code does not exist in the database');
    }

    const user = await User.findByPk(payload.userId, { paranoid: true });

    if (!user) {
      errors.push('Alleged QR code creator does not exist in the database.');
    }

    if (payload.timestamp !== qrCode.timestamp) {
    }
  };
}
