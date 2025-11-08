import express from 'express';
import UserController from '../../controllers/user-controller.js';

const router = express.Router();
const userController = new UserController();

router.post(
  /*
    #swagger.summary = 'Create a user'
    #swagger.description = 'Create a new user'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewUser' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'User created successfully - No content'
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            invalidFields: {
              summary: 'An example of invalid values',
              value: {
                message: 'Validation error.',
                errors: ['Validation validationName on field failed']
              }
            }
          }
        }
      }
    }
    #swagger.responses[409] = {
      description: 'Conflict - User cannot be created (e.g., conflicting username)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            conflict: { $ref: '#/components/examples/ConflictError' }
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
            internal: { $ref: '#/components/examples/InternalServerError' }
          }
        }
      }
    }
  */
  '/',
  userController.createUser
);
router.post(
  /*
    #swagger.summary = 'User login'
    #swagger.description = 'User login'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            oneOf: [
              { $ref: '#/components/schemas/UsernameLogin' },
              { $ref: '#/components/schemas/EmailLogin' }
            ]
          }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'User logged in successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Token' }
        }
      }
    }
    #swagger.responses[401] = {
      description: 'Unauthorized - Invalid credentials',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            unauthorized: { $ref: '#/components/examples/UnauthorizedError' }
          }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Not found - User does not exist',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            notFound: { $ref: '#/components/examples/NotFoundError' }
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
            internalServer: { $ref: '#/components/examples/InternalServerError' }
          }
        }
      }
    }
  */
  '/login',
  userController.login
);

export default router;
