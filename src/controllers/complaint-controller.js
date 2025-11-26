import Complaint from '../models/complaint.js';
import CustomError from '../models/custom-error.js';
import QRCode from '../models/qr-code.js';
import User from '../models/user.js';

export default class ComplaintController {
  createComplaint = async (req, res) => {
    const { deviceId, qrCodeId, description, userId } = req.body;

    const errors = [];

    if (userId && !(await User.findByPk(userId))) {
      errors.push('Usuário não encontrado');
    }

    const qrCode = await QRCode.findByPk(qrCodeId);

    if (!qrCode) {
      errors.push('QR code não encontrado');
    }

    if (errors.length > 0) {
      throw new CustomError(
        'Dados de requisição de reclamação inválidos.',
        400,
        ...errors
      );
    }

    // Verifica se já existe reclamação para este device e qrCode
    const existing = await Complaint.findOne({ where: { deviceId, qrCodeId } });
    if (existing) {
      throw new CustomError(
        'Dispositivo já possui reclamação para este QR code.',
        409
      );
    }

    const complaintData = { deviceId, qrCodeId };
    if (description) {
      complaintData.description = description;
    }
    if (userId) {
      complaintData.userId = userId;
    }

    await Complaint.create(complaintData);

    const count = await Complaint.count({ where: { qrCodeId } });

    if (count >= 3) {
      await QRCode.destroy({ where: { id: qrCodeId } });
    }

    res.sendStatus(201);
  };

  canSubmitComplaint = async (req, res) => {
    const { deviceId, qrCodeId } = req.query;

    if (!deviceId || !qrCodeId) {
      throw new CustomError(
        'Parâmetros ausentes para verificação de reclamação.',
        400,
        ...[
          !deviceId ? 'deviceId ausente' : null,
          !qrCodeId ? 'qrCodeId ausente' : null,
        ].filter(Boolean)
      );
    }

    // Verifica existência do QR code
    const qrCode = await QRCode.findByPk(qrCodeId);
    if (!qrCode) {
      throw new CustomError('QR code não encontrado.', 404);
    }

    const existing = await Complaint.findOne({ where: { deviceId, qrCodeId } });
    res.status(200).send({ canSubmit: !existing });
  };
}
