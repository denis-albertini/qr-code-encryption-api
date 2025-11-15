import { toDataURL as createQRCodeURl } from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import CustomError from '../models/custom-error.js';
import QRCode from '../models/qr-code.js';
import User from '../models/user.js';
import { CryptoService } from '../services/crypto-service.js';

export default class QRCodeController {
  #cryptoService;

  constructor() {
    this.#cryptoService = new CryptoService();
  }

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
      signature = await this.#cryptoService.signWithSHA256(
        payload,
        user.privateKey
      );
    } catch (error) {
      throw new CustomError(error.message, 500, ...error.errors);
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
    const { signature, ...payload } = req.body;

    const user = await User.findOne({ where: { username: payload.username } });

    if (!user) {
      throw new CustomError('Payload username does not belong to a user.', 400);
    }

    let isValid;

    try {
      isValid = await this.#cryptoService.verifyWithSHA256(
        payload,
        user.publicKey,
        signature
      );
    } catch (error) {
      throw new CustomError(error.message, 500, ...error.errors);
    }

    if (!isValid) {
      throw new CustomError('QR code signature is invalid.', 400);
    }

    res.sendStatus(204);
  };
}
