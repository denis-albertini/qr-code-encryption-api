import crypto from 'crypto';
import { toDataURL as createQRCodeURl } from 'qrcode';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import CustomError from '../models/custom-error.js';
import QRCode from '../models/qr-code.js';
import User from '../models/user.js';

const cryptoAsyncSign = promisify(crypto.sign);
const cryptoAsyncVerify = promisify(crypto.verify);

export default class QRCodeController {
  generateQRCode = async (req, res) => {
    const { userId, content } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new CustomError('User does not exist.', 404);
    }

    const payload = {
      id: uuidv4(),
      username: user.username,
      createdAt: Date.now(),
      content,
    };

    let signature;

    try {
      signature = (
        await cryptoAsyncSign('sha256', Buffer.from(JSON.stringify(payload)), {
          key: user.privateKey,
          type: 'pkcs8',
          format: 'pem',
        })
      ).toString('base64');
    } catch (error) {
      throw new CustomError('Failed to sign payload.', 500, error.message);
    }

    const signedPayload = { ...payload, signature };

    let qrCodeUrl;

    try {
      qrCodeUrl = await createQRCodeURl(JSON.stringify(signedPayload));
    } catch (error) {
      throw new CustomError(
        'Failed to create the QR code URL.',
        500,
        error.message
      );
    }

    await QRCode.create({ ...signedPayload, userId });

    res.status(201).send({ qrCodeUrl });
  };

  verifyQRCode = async (req, res) => {
    const signedPayload = req.body;

    const { signature, ...payload } = signedPayload;

    const user = await User.findOne({ where: { username: payload.username } });

    if (!user) {
      throw new CustomError('Payload userId does not belong to a user.', 400);
    }

    let isValid;

    try {
      isValid = await cryptoAsyncVerify(
        'sha256',
        Buffer.from(JSON.stringify(payload)),
        user.publicKey,
        Buffer.from(signature, 'base64')
      );
    } catch (error) {
      throw new CustomError(
        'Failed to verify QR code signature.',
        500,
        error.message
      );
    }

    if (!isValid) {
      throw new CustomError('QR code signature is invalid.', 400);
    }

    res.sendStatus(204);
  };
}
