import { generateKeyPair, sign, verify } from 'crypto';
import { promisify } from 'util';

const generateKeyPairAsync = promisify(generateKeyPair);
const signAsync = promisify(sign);
const verifyAsync = promisify(verify);

export class CryptoError extends Error {
  constructor(message, ...errors) {
    super(message);
    this.errors = errors;
    this.name = 'CryptoError';
  }
}

export class CryptoService {
  async generateRSAKeys() {
    try {
      return await generateKeyPairAsync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
    } catch (error) {
      throw new CryptoError('Failed to generate RSA keys.', error.message);
    }
  }

  async signWithSHA256(content, key) {
    try {
      const signature = await signAsync(
        'sha256',
        Buffer.from(JSON.stringify(content)),
        { key, type: 'pkcs8', format: 'pem' }
      );
      return signature.toString('base64');
    } catch (error) {
      throw new CryptoError('Failed to sign content.', error.message);
    }
  }

  async verifyWithSHA256(content, key, signature) {
    try {
      return await verifyAsync(
        'sha256',
        Buffer.from(JSON.stringify(content)),
        key,
        Buffer.from(signature, 'base64')
      );
    } catch (error) {
      throw new CryptoError('Failed to verify signature.', error.message);
    }
  }
}
