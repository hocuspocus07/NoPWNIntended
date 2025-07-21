import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type StartTLSMode = 'none' | 'smtp' | 'ftp' | 'imap' | 'pop3' | 'ldap';
type TLSVersion = 'ssl2' | 'ssl3' | 'tls1' | 'tls1_1' | 'tls1_2' | 'tls1_3';

export async function runSSLscan(
  target: string,
  starttls: StartTLSMode = 'none',
  options: {
    certs?: boolean;
    heartbleed?: boolean;
    compression?: boolean;
    fallback?: boolean;
    signatures?: boolean;
  } = {}
) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  const args = [
    target,
    starttls,
    options.certs?.toString() || 'false',
    options.heartbleed?.toString() || 'false',
    options.compression?.toString() || 'false',
    options.fallback?.toString() || 'false',
    options.signatures?.toString() || 'false'
  ].join(' ');

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-sslscan.sh ${args}`
    );
    return stdout;
  } catch (error: any) {
    console.error("ERROR:", error.stderr ?? error.message);
    throw new Error(`testssl.sh scan failed: ${error.stderr || error.message}`);
  }
}
