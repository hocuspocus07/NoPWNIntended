import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type HashType = 'auto' | 'ntlm' | 'sha256' | 'sha512' | 'wpa' | 'django' | 'sha512crypt';
type AttackMode = 'straight' | 'combination' | 'brute' | 'hybrid_wm' | 'hybrid_mw';
type WordlistPreset = 'rockyou' | 'crackstation' | 'weakpass' | string;
type WorkloadProfile = '1' | '2' | '3' | '4';

export async function runHashcat(
  hash: string,
  hashType: HashType,
  wordlist: WordlistPreset,
  attackMode: AttackMode,
  rulesFile: string = '',
  workload: WorkloadProfile = '3',
  usePotfile: boolean = false
) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  const args = [
    hash,
    hashType,
    wordlist,
    attackMode,
    rulesFile,
    workload,
    usePotfile.toString().toLowerCase()
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-hashcat.sh ${args.join(' ')}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`Hashcat execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}