import crypto from 'crypto';
import { exec } from 'child_process';
import { fileTypeFromBuffer } from 'file-type';

// Allowed extensions (lowercase)
const allowedExtensions = ['exe', 'elf', 'bin'];

// validate the file type 
export async function validateFileType(buffer: Buffer): Promise<boolean> {
  const detected = await fileTypeFromBuffer(buffer);
  return !!detected && allowedExtensions.includes(detected.ext.toLowerCase());
}

// hash the buffer content 
export async function hashBuffer(buffer: Buffer): Promise<string> {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(buffer);
  return hashSum.digest('hex');
}

import { tmpdir } from 'os';
import path from 'path';
import fs from 'fs/promises';

export async function getVirusScanResult(buffer: Buffer): Promise<boolean> {
  const tempFileName = path.join(tmpdir(), `scan-${crypto.randomUUID()}`);
  try {
    await fs.writeFile(tempFileName, buffer);

    return await new Promise((resolve, reject) => {
      exec(`clamscan --no-summary ${tempFileName}`, (error, stdout, stderr) => {
        if (error) return reject(error);
        const cleanString = `${tempFileName}: OK`;
        resolve(stdout.includes(cleanString));
      });
    });
  } finally {
    await fs.unlink(tempFileName).catch(() => {});
  }
}
