import crypto from 'crypto';
import zlib from 'zlib';
import base45 from 'base45';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import CustomError from '../models/custom-error.js';
import QRCode from '../models/qr-code.js';
import User from '../models/user.js';
import Complaint from '../models/complaint.js';

const cryptoAsyncSign = promisify(crypto.sign);
const cryptoAsyncVerify = promisify(crypto.verify);

export default class QRCodeController {
  handleAppNameInQrCode(qrCodeContent, removeFromCode = false) {
    const appName = process.env.APP_NAME || 'QRypt';
    if (removeFromCode) {
      return qrCodeContent.replace(`${appName}.`, '');
    } else {
      return `${appName}.${qrCodeContent}`;
    }
  }

  generateQRCode = async (req, res) => {
    const { userId, content } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new CustomError('Usuário não existe.', 404);
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
      throw new CustomError('Falha ao assinar payload.', 500, error.message);
    }

    const signedPayload = { ...payload, signature };

    let compressedBuffer;
    try {
      compressedBuffer = zlib.deflateSync(
        Buffer.from(JSON.stringify(signedPayload))
      );
    } catch (error) {
      throw new CustomError(
        'Falha ao comprimir payload do QR code.',
        500,
        error.message
      );
    }

    let qrCodeText;
    try {
      qrCodeText = base45.encode(compressedBuffer);
    } catch (error) {
      throw new CustomError(
        'Falha ao codificar texto do QR code.',
        500,
        error.message
      );
    }

    await QRCode.create({ ...signedPayload, userId });

    res.status(201).send(this.handleAppNameInQrCode(qrCodeText));
  };

  verifyQRCode = async (req, res) => {
    const { qrCodeText } = req.body;

    if (!qrCodeText || typeof qrCodeText !== 'string') {
      throw new CustomError('Texto de QR code inválido.', 400);
    }

    // Remove app prefix if present
    const normalizedText = this.handleAppNameInQrCode(qrCodeText, true);

    let signedPayload;
    try {
      const compressedBuffer = base45.decode(normalizedText);
      const jsonBuffer = zlib.inflateSync(compressedBuffer);
      signedPayload = JSON.parse(jsonBuffer.toString('utf-8'));
    } catch (error) {
      throw new CustomError(
        'Falha ao decodificar texto do QR code.',
        400,
        error.message
      );
    }

    const { signature, ...payload } = signedPayload;

    const user = await User.findOne({ where: { username: payload.username } });

    if (!user) {
      throw new CustomError(
        'Nome de usuário do payload não pertence a nenhum usuário.',
        400
      );
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
        'Falha ao verificar assinatura do QR code.',
        500,
        error.message
      );
    }

    if (!isValid) {
      throw new CustomError('Assinatura do QR code inválida.', 400);
    }

    // Invalidate codes with too many complaints
    const complaintsCount = await Complaint.count({
      where: { qrCodeId: payload.id },
    });
    if (complaintsCount >= 3) {
      throw new CustomError('QR code inválido devido a reclamações.', 400);
    }

    // Build flat JSON info (plain text data) about the QR code
    const flatData = {
      id: payload.id,
      username: payload.username,
      createdAt: new Date(payload.createdAt).toISOString(),
      content: payload.content,
      signature,
      complaintsCount,
    };

    res.status(200).send(flatData);
  };

  listByUser = async (req, res) => {
    const { userId } = req.params;

    const page = Math.max(parseInt(req.query.page ?? '1', 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit ?? '8', 10) || 8, 1);
    const offset = (page - 1) * limit;

    const { rows, count } = await QRCode.findAndCountAll({
      where: { userId },
      attributes: ['id', 'content', 'signature', 'userId', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Fetch username once for all user's QR codes
    const user = await User.findByPk(userId, { attributes: ['username'] });
    const username = user?.username;

    const totalPages = Math.max(Math.ceil(count / limit), 1);
    res.set('X-Total-Count', String(count));
    res.set('X-Total-Pages', String(totalPages));
    res.set('X-Page', String(page));
    res.set('X-Page-Size', String(limit));
    const serialized = rows.map(r => {
      const createdAtDate = r.get('createdAt');
      const createdAtMs =
        createdAtDate instanceof Date
          ? createdAtDate.getTime()
          : new Date(createdAtDate).getTime();

      const signedPayload = {
        id: r.get('id'),
        username: username,
        createdAt: createdAtMs,
        content: r.get('content'),
        signature: r.get('signature'),
      };

      let qrCodeText;
      try {
        const compressed = zlib.deflateSync(
          Buffer.from(JSON.stringify(signedPayload))
        );
        qrCodeText = this.handleAppNameInQrCode(base45.encode(compressed));
      } catch (_err) {
        // If serialization fails for any, surface a generic error
        throw new CustomError('Falha ao construir texto do QR code.', 500);
      }

      const o = r.toJSON();
      return {
        ...o,
        createdAt:
          createdAtDate instanceof Date
            ? createdAtDate.toISOString()
            : o.createdAt,
        qrCodeText,
        issuerName: username,
      };
    });

    res.status(200).send(serialized);
  };
}
