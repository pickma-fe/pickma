import { randomBytes } from 'crypto';

const secret = randomBytes(32).toString('base64url');
process.stdout.write(`AUTH_EMAIL_HASH_SECRET=${secret}\n`);
