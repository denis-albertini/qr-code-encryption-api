import express from 'express';
import QRCodeController from '../../controllers/qr-code-controller.js';
import { userAuthMiddleware } from '../middlewares/auth-middleware.js';

const router = express.Router();
const qrCodeController = new QRCodeController();

router.post('/verify', qrCodeController.verifyQRCode);

router.use(userAuthMiddleware);
router.post('/', qrCodeController.generateQRCode);

export default router;
