import Complaint from '../models/complaint.js';
import CustomError from '../models/custom-error.js';
import QRCode from '../models/qr-code.js';
import User from '../models/user.js';

export default class ComplaintController {
  createComplaint = async (req, res) => {
    const { userId, qrCodeId, description, deviceId } = req.body;

    const errors = [];

    if (userId && !(await User.findByPk(userId))) {
      errors.push('User not found');
    }

    const qrCode = await QRCode.findByPk(qrCodeId);

    if (!qrCode) {
      errors.push('QR code not found');
    }

    if (errors.length > 0) {
      throw new CustomError('Invalid complaint request data.', 400, ...errors);
    }

    await Complaint.create({ userId, qrCodeId, description, deviceId });

    const count = await Complaint.count({ where: { qrCodeId } });

    if (count >= 3) {
      await QRCode.destroy({ where: { id: qrCodeId } });
    }

    res.sendStatus(201);
  };
}
