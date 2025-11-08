import express from 'express';
import ComplaintController from '../../controllers/complaint-controller.js';

const router = express.Router();
const complaintController = new ComplaintController();

router.post('/', complaintController.createComplaint);

export default router;
