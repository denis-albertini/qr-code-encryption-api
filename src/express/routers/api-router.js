import express from 'express';
import complaintRouter from './complaint-router.js';
import docRouter from './doc-router.js';
import qrCodeRouter from './qr-code-router.js';
import userRouter from './user-router.js';

const router = express.Router();

router.use(
  '/users',
  userRouter
  // #swagger.tags = ['Users']
);
router.use(
  '/qr-codes',
  qrCodeRouter
  // #swagger.tags = ['QRCodes']
);
router.use(
  '/complaints',
  complaintRouter
  // #swagger.tags = ['Complaints']
);
router.use(
  '/doc',
  docRouter
  // #swagger.ignore = true
);

export default router;
