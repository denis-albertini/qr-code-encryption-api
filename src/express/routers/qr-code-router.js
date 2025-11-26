import express from 'express';
import QRCodeController from '../../controllers/qr-code-controller.js';
import { userAuthMiddleware } from '../middlewares/auth-middleware.js';

const router = express.Router();
const qrCodeController = new QRCodeController();

router.post(
  '/verify',
  /*
    #swagger.summary = 'Verify a QR code'
    #swagger.description = 'Verify a QR code text (base45 + deflate) and signature; invalid if too many complaints'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/QRCodeVerifyText' }
        }
      }
    }
    #swagger.responses[204] = {
      description: 'QR code is valid - No content'
    }
    #swagger.responses[200] = {
      description: 'QR code is valid - Full details',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/VerifiedQRCode' }
        }
      }
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
              summary: 'An example of too many complaints',
              value: {
                message: 'QR code is invalid due to complaints.',
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
    #swagger.description = 'Generate a signed QR code as compressed base45 text'
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
      description: 'QR code text generated successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/QRCodeText' }
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
              summary: 'An example of a compression failure',
              value: {
                message: 'Failed to compress QR code payload.',
                errors: []
              }
            },
            e3: {
              summary: 'An example of an encoding failure',
              value: {
                message: 'Failed to encode QR code text.',
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

router.get(
  '/users/:userId',
  /*
    #swagger.summary = 'List user QR codes'
    #swagger.description = 'Get all QR codes associated with a userId'
    #swagger.security = [{ 'UserAuth': [] }]
    #swagger.parameters['userId'] = {
      in: 'path',
      required: true,
     schema: { type: 'string' }
    }
    #swagger.parameters['page'] = {
      in: 'query',
      required: false,
      schema: { type: 'integer'}
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      required: false,
      schema: { type: 'integer' }
    }
    #swagger.responses[200] = {
      description: 'List of QR codes',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                content: { type: 'string' },
                signature: { type: 'string' },
                userId: { type: 'string', format: 'uuid' },
                createdAt: { type: 'string', format: 'date-time' },
                qrCodeText: { type: 'string' },
                issuerName: { type: 'string' }
              }
            }
          }
        }
      }
    }
    #swagger.responses[401] = { description: 'Unauthorized - User authentication required' }
  */
  qrCodeController.listByUser
);

export default router;
