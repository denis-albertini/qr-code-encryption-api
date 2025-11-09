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
      ConflictError: {
        summary: 'An example of a unique constraint error',
        value: {
          message: 'Unique constraint error.',
          errors: [
            'duplicating key value violates unique constraint "table_field_key"',
          ],
        },
      },
      InternalServerError: {
        summary: 'An example of a internal server error',
        value: {
          message: 'Internal server error.',
          errors: ['Failed to do something', 'Refer to console'],
        },
      },
      NotFoundError: {
        summary: 'An example of a not found error',
        value: {
          message: 'User does not exist.',
          errors: [],
        },
      },
      UnauthorizedError: {
        summary: 'An example of an unauthorized error',
        value: {
          message: 'Invalid credentials.',
          errors: ['Password does not match'],
        },
      },
    },
  },
};

const outputFile = './swagger-output.json';
const routes = ['./src/express/app.js'];

await swaggerAutogen({ openapi: '3.0.4' })(outputFile, routes, doc);

/*
  A solution to byspass trailing slashes in paths because of
  strict swagger-autogen path generation and
  strict express-openapi-validator paths validation
*/
const swaggerDoc = JSON.parse(fs.readFileSync('./swagger-output.json'));

const normalizedPaths = {};
Object.keys(swaggerDoc.paths).forEach(path => {
  const normalizedPath =
    path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  normalizedPaths[normalizedPath] = swaggerDoc.paths[path];
});

swaggerDoc.paths = normalizedPaths;
fs.writeFileSync('./swagger-output.json', JSON.stringify(swaggerDoc, null, 2));
