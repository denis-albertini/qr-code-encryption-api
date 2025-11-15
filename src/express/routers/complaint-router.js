import express from 'express';
import ComplaintController from '../../controllers/complaint-controller.js';

const router = express.Router();
const complaintController = new ComplaintController();

router.post(
  '/',
  /*
    #swagger.summary = 'Create a complaint'
    #swagger.description = 'Create a new complaint'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewComplaint' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Complaint created successfully - No content'
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            e1: { $ref: '#/components/examples/InvalidComplaintData' }
          }
        }
      }
    }
    #swagger.responses[409] = {
      description: 'Conflict - Complaint cannot be created',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            e1: { $ref: '#/components/examples/ConflictingDeviceId' }
          }
        }
      }
    }
  */
  complaintController.createComplaint
);

export default router;
