import crypto from 'crypto';
import CommunicateHandler from './../CommunicateHandler';

export class Encryption {
  protected key: Buffer;

  constructor(masterkey: string, salt: string) {
    this.key = crypto.pbkdf2Sync(masterkey, salt, 2145, 32, 'sha512');
  }

  decrypt(encdata: string) {
    const buffer = Buffer.from(encdata, 'base64');
    const iv = buffer.subarray(0, 16);
    const data = buffer.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
    const text =
      decipher.update(data).toString('utf8') + decipher.final('utf8');
    return text;
  }

  encrypt(plain: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    return Buffer.concat([
      iv,
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]).toString('base64');
  }
}

const EncryptionDict: Record<string, Encryption> = {};

CommunicateHandler.handle(
  'encrypt',
  ([text, masterkey, salt]: [string, string, string]) => {
    try {
      const key = masterkey + '_' + salt;
      if (!EncryptionDict[key]) {
        EncryptionDict[key] = new Encryption(masterkey, salt);
      }

      return EncryptionDict[key].encrypt(text);
    } catch {
      return null;
    }
  },
);

CommunicateHandler.handle(
  'decrypt',
  ([encrypted, masterkey, salt]: [string, string, string]) => {
    try {
      const key = masterkey + '_' + salt;
      if (!EncryptionDict[key]) {
        EncryptionDict[key] = new Encryption(masterkey, salt);
      }

      return EncryptionDict[key].decrypt(encrypted);
    } catch {
      return null;
    }
  },
);
