import express from 'express';
import QRCodeController from '../../controllers/qr-code-controller.js';
import { userAuthMiddleware } from '../middlewares/auth-middleware.js';

const router = express.Router();
const qrCodeController = new QRCodeController();

router.post(
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
            userNotFound: {
              summary: 'An example of an invalid user id',
              value: {
                message: 'Payload userId does not belong to a user.',
                errors: []
              }
            },
            invalidQRCode: {
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
            generic: { $ref: '#/components/examples/InternalServerError' }
          }
        }
      }
    }
  */
  '/verify',
  qrCodeController.verifyQRCode
);

router.use(userAuthMiddleware);
router.post(
  /*
    #swagger.summary = 'Generate a QR code'
    #swagger.description = 'Generate a signed QR code'
    #swagger.security = [{'UserAuth': []}]
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
            userNotFound: { $ref: '#/components/examples/NotFoundError' }
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
            generic: { $ref: '#/components/examples/InternalServerError' }
          }
        }
      }
    }
  */
  '/',
  qrCodeController.generateQRCode
);

export default router;
