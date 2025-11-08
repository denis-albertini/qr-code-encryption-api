import { Router } from 'express';
import { readFileSync } from 'fs';
import { serve, setup } from 'swagger-ui-express';

const swaggerDocument = JSON.parse(
  readFileSync('./swagger-output.json', 'utf8')
);

const router = Router();

router.use('/', serve);
router.get('/', setup(swaggerDocument));

export default router;
