import { middleware } from 'express-openapi-validator';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const openapiValidatorMiddleware = middleware({
  apiSpec: path.join(__dirname, '../../../swagger-doc.json'),
  validateResponses: true,
  ignorePaths: /^\/(api\/doc|favicon\.ico|.*\.css|.*\.js|.*\.png)/,
});
