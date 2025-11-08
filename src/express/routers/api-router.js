import express from 'express';
import complaintRouter from './complaint-router.js';
import qrCodeRouter from './qr-code-router.js';
import userRouter from './user-router.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/qr-codes', qrCodeRouter);
router.use('/complaints', complaintRouter);

export default router;
