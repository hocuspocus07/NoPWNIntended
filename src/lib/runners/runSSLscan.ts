import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type StartTLSMode = 'none' | 'smtp' | 'ftp' | 'imap' | 'pop3' | 'ldap';
type TLSVersion = 'ssl2' | 'ssl3' | 'tls1' | 'tls1_1' | 'tls1_2' | 'tls1_3';

export async function runSSLscan(
  target: string,
  starttls: StartTLSMode = 'none',
  versions: TLSVersion[] = ['tls1_2', 'tls1_3'],
  options: {
    certs?: boolean;
    heartbleed?: boolean;
    compression?: boolean;
    fallback?: boolean;
    signatures?: boolean;
  } = {}
): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // validate target format
  if (!target.match(/^[a-zA-Z0-9.-]+(:[0-9]+)?$/)) {
    throw new Error('Invalid target format (hostname:port)');
  }

  const args = [
    target,
    starttls,
    versions.join(','),
    options.certs?.toString() || 'false',
    options.heartbleed?.toString() || 'false',
    options.compression?.toString() || 'false',
    options.fallback?.toString() || 'false',
    options.signatures?.toString() || 'false'
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-testssl.sh ${args.join(' ')}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`testssl.sh scan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}