import express from 'express';
import ComplaintController from '../../controllers/complaint-controller.js';

const router = express.Router();
const complaintController = new ComplaintController();

router.post(
  '/',
  /*
    #swagger.summary = 'Criar uma reclamação'
    #swagger.description = 'Cria uma nova reclamação. Campo userId é opcional.'
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
            e1: {
              summary: 'An example of invalid values',
              value: {
                message: 'Dados de requisição de reclamação inválidos.',
                errors: [
                  'Usuário não encontrado',
                  'QR code não encontrado'
                ]
              }
            }
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
            e1: {
              summary: 'An example of a deviceId conflict',
              value: {
                message: 'Conflitos de valores únicos.',
                errors: ['Valor único já existe para complaint_device_id']
              }
            }
          }
        }
      }
    }
  */
  complaintController.createComplaint
);

router.get(
  '/can-submit',
  /*
    #swagger.summary = 'Verificar possibilidade de reclamação'
    #swagger.description = 'Retorna se um device pode registrar reclamação para um QR code específico.'
    #swagger.parameters['deviceId'] = {
      in: 'query',
      description: 'Identificador do dispositivo',
      required: true,
      schema: { type: 'string' }
    }
    #swagger.parameters['qrCodeId'] = {
      in: 'query',
      required: true,
      schema: { type: 'string' }
    }
    #swagger.responses[200] = {
      description: 'Indicação se pode registrar',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: { canSubmit: { type: 'boolean' } }
          },
          examples: {
            e1: { summary: 'Pode registrar', value: { canSubmit: true } },
            e2: { summary: 'Já registrado', value: { canSubmit: false } }
          }
        }
      }
    }
    #swagger.responses[400] = { description: 'Parâmetros ausentes' }
    #swagger.responses[404] = { description: 'QR code não encontrado' }
  */
  complaintController.canSubmitComplaint
);

export default router;
