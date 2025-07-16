import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

export async function runDNSGen(inputFile: string) {
    const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
    
    try {
        const escapedInputFile = `'${inputFile.replace(/'/g, "'\\''")}'`;
        
        const { stdout } = await asyncExec(
            `docker exec ${container} /docker/scripts/run-dnsgen.sh ${escapedInputFile}`
        );
        
        return stdout;
    } catch (error) {
        throw new Error(`DNSGen execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}