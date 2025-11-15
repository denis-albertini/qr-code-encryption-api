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
            e1: { $ref: '#/components/examples/InvalidPayloadUsername' },
            e3: { $ref: '#/components/examples/InvalidSignature' }
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
            e1: { $ref: '#/components/examples/SignatureVerifyError' }
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
      description: 'Unauthorized - User authentication required',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            e1: { $ref: '#/components/examples/MissingCredentials' }
          }
        }
      }
    }
    #swagger.responses[403] = {
      description: 'Forbidden - Insufficient credentials',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            e1: { $ref: '#/components/examples/InvalidTokenPayload' }
          }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            e1: { $ref: '#/components/examples/UserNotFound' }
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
            e1: { $ref: '#/components/examples/ConflictingSignature' }
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
            e1: { $ref: '#/components/examples/ContentSignError' },
            e2: { $ref: '#/components/examples/CreateQRCodeUrlError' }
          }
        }
      }
    }
  */
  qrCodeController.generateQRCode
);

export default router;
