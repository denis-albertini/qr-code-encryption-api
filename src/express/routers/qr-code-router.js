import express from 'express';
import QRCodeController from '../../controllers/qr-code-controller.js';
import { userAuthMiddleware } from '../middlewares/auth-middleware.js';

const router = express.Router();
const qrCodeController = new QRCodeController();

router.post(
  '/verify',
  /*
    #swagger.summary = 'Verify a QR code'
    #swagger.description = 'Verify a QR code's signature'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Payload' }
        }
      }
    }
    #swagger.responses[204] = {
      description: 'QR code is valid - No content'
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            e1: {
              summary: 'An example of an invalid username',
              value: {
                message: 'Payload username does not belong to a user.',
                errors: []
              }
            },
            e2: {
              summary: 'An example of an invalid QR code',
              value: {
                message: 'QR code signature is invalid.',
                errors: []
              }
            }
          }
        }
      }
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            e1: {
              summary: 'An example of a signature verification error',
              value: {
                message: 'Failed to verify QR code signature.',
                errors: ['Some message']
              }
            }
          }
        }
      }
    }
  */
  qrCodeController.verifyQRCode
);

router.use(userAuthMiddleware);
router.post(
  '/',
  /*
    #swagger.summary = 'Generate a QR code'
    #swagger.description = 'Generate a signed QR code'
    #swagger.security = [{ 'UserAuth': [] }]
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewQRCode' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'QR code generated successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/QRCodeUrl' }
        }
      }
    }
    #swagger.responses[401] = {
      description: 'Unauthorized - User authentication required'
    }
    #swagger.responses[404] = {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            e1: {
              summary: 'An example of a not found user',
              value: {
                message: 'User does not exist.',
                errors: []
              }
            }
          }
        }
      }
    }
    #swagger.responses[409] = {
      description: 'Conflict - QR code cannot be created',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            e1: {
              summary: 'An example of a conflicting signature',
              value: {
                message: 'Unique constraint error.',
                errors: ['Value already exists for qr_code_signature']
              }
            }
          }
        }
      }
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            e1: {
              summary: 'An example of a payload signature failure',
              value: {
                message: 'Failed to sign payload.',
                errors: []
              }
            },
            e2: {
              summary: 'An example of a qr code url generation failure',
              value: {
                message: 'Failed to create the QR code URL.',
                errors: []
              }
            }
          }
        }
      }
    }
  */
  qrCodeController.generateQRCode
);

export default router;
