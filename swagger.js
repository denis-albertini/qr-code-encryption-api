import fs from 'fs';
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '1.0.0',
    title: 'QR Code Encryption System API',
    description: '',
  },
  tags: [
    { name: 'Users', description: 'Users management endpoints' },
    { name: 'QRCodes', description: 'QR codes management endpoints' },
    { name: 'Complaints', description: 'Complaints managment endpoints' },
  ],
  components: {
    securitySchemes: {
      UserAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    '@schemas': {
      NewUser: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        additionalProperties: false,
      },
      UsernameLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        additionalProperties: false,
      },
      EmailLogin: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
        additionalProperties: false,
      },
      Token: {
        type: 'object',
        required: ['token'],
        properties: { token: { type: 'string' } },
        additionalProperties: false,
      },
      Payload: {
        type: 'object',
        required: ['id', 'username', 'createdAt', 'content', 'signature'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          createdAt: { type: 'integer' },
          content: { type: 'string' },
          signature: { type: 'string' },
        },
        additionalProperties: false,
      },
      NewQRCode: {
        type: 'object',
        required: ['userId', 'content'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
        },
        additionalProperties: false,
      },
      QRCodeUrl: {
        type: 'object',
        required: ['qrCodeUrl'],
        properties: { qrCodeUrl: { type: 'string' } },
        additionalProperties: false,
      },
      NewComplaint: {
        type: 'object',
        required: ['deviceId', 'qrCodeId', 'description', 'userId'],
        properties: {
          deviceId: { type: 'string' },
          qrCodeId: { type: 'string', format: 'uuid' },
          description: { type: 'string', nullable: true },
          userId: { type: 'string', format: 'uuid', nullable: true },
        },
        additionalProperties: false,
      },
      Error: {
        type: 'object',
        required: ['message', 'errors'],
        properties: {
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    },
    examples: {
      ValidationError: {
        summary: 'An example of a validation error',
        value: {
          message: 'Validation error.',
          errors: ['Validation validationName on fieldName failed'],
        },
      },
      ConflictingUsername: {
        summary: 'An example of a conflicting username',
        value: {
          message: 'Unique constraint error.',
          errors: ['Value already exists for user_username'],
        },
      },
      ConflictingEmail: {
        summary: 'An example of a conflicting email',
        value: {
          message: 'Unique constraint error.',
          errors: ['Value already exists for user_email'],
        },
      },
      KeyGenError: {
        summary: 'An example of a key gen error',
        value: {
          message: 'Failed to generate RSA keys.',
          errors: ['Some error message'],
        },
      },
      TokenSignError: {
        summary: 'An example of a jwt sign error',
        value: {
          message: 'Failed to sign token.',
          errors: ['Some error message'],
        },
      },
      AccountConfirmationEmailError: {
        summary: 'An example of an account confirmation email error',
        value: {
          message: 'Failed to send account confirmation email.',
          errors: ['Some error message'],
        },
      },
      UserCreationError: {
        summary: 'An example of an user creation error',
        value: {
          message: 'Failed to create user account.',
          errors: ['Some error message'],
        },
      },
      ExpiredToken: {
        summary: 'An example of an expired token',
        value: {
          message: 'Token expired.',
          errors: [],
        },
      },
      InvalidTokenPayload: {
        summary: 'An example of an invalid token payload',
        value: {
          message: 'Forbidden.',
          errors: ['Invalid token'],
        },
      },
      NotPendingAccount: {
        summary: 'An example of a not pending account',
        value: {
          message: 'User account is not pending.',
          errors: [],
        },
      },
      TokenVerifyError: {
        summary: 'An example of a token verification error',
        value: {
          message: 'Failed to verify token.',
          errors: [],
        },
      },
      WrongPasswordError: {
        summary: 'An example of a wrong password',
        value: {
          message: 'Invalid credentials.',
          errors: ['Password does not match'],
        },
      },
      UserNotFound: {
        summary: 'An example of an user not found',
        value: {
          message: 'User does not exist.',
          errors: [],
        },
      },
      ComparePasswordsError: {
        summary: 'An example of a password compare error',
        value: {
          message: 'Failed to compare passwords on login.',
          errors: [],
        },
      },
      ConflictingSignature: {
        summary: 'An example of a conflicting signature',
        value: {
          message: 'Unique constraint error.',
          errors: ['Value already exists for qr_code_signature'],
        },
      },
      ContentSignError: {
        summary: 'An example of a content sign error',
        value: {
          message: 'Failed to sign content.',
          errors: [],
        },
      },
      CreateQRCodeUrlError: {
        summary: 'An example of a qr code url creation failure',
        value: {
          message: 'Failed to create the QR code URL.',
          errors: [],
        },
      },
      InvalidPayloadUsername: {
        summary: 'An example of an invalid username',
        value: {
          message: 'Payload username does not belong to a user.',
          errors: [],
        },
      },
      SignatureVerifyError: {
        summary: 'An example of a signature verification error',
        value: {
          message: 'Failed to verify signature.',
          errors: [],
        },
      },
      InvalidSignature: {
        summary: 'An example of an invalid QR code',
        value: {
          message: 'QR code signature is invalid.',
          errors: [],
        },
      },
      InvalidComplaintData: {
        summary: 'An example of an invalid complaint data',
        value: {
          message: 'Invalid complaint request data.',
          errors: ['User not found', 'QR code not found'],
        },
      },
      ConflictingDeviceId: {
        summary: 'An example of a deviceId conflict',
        value: {
          message: 'Unique constraint error.',
          errors: ['Value already exists for complaint_device_id'],
        },
      },
      MissingCredentials: {
        summary: 'An example of a missing credential',
        value: {
          message: 'Invalid credentials.',
          errors: ['Missing credentials'],
        },
      },
    },
  },
};

const outputFile = './swagger-doc.json';
const routes = ['./src/express/app.js'];

await swaggerAutogen({ openapi: '3.0.4' })(outputFile, routes, doc);

/*
  A solution to byspass trailing slashes in paths because of
  strict swagger-autogen path generation and
  strict express-openapi-validator paths validation
*/
const swaggerDoc = JSON.parse(fs.readFileSync('./swagger-doc.json'));

const normalizedPaths = {};
Object.keys(swaggerDoc.paths).forEach(path => {
  const normalizedPath =
    path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  normalizedPaths[normalizedPath] = swaggerDoc.paths[path];
});

swaggerDoc.paths = normalizedPaths;
fs.writeFileSync('./swagger-doc.json', JSON.stringify(swaggerDoc, null, 2));
