import { exec } from "child_process";
import util from "util"

const asyncExec=util.promisify(exec)

export async function runAssetFinder(domain:string){
    const container=process.env.NEXT_PUBLIC_CONTAINER_NAME
    try{
        const {stdout}=await asyncExec(`docker exec ${container} /docker/scripts/run-assetfinder.sh ${domain}`);
        return stdout
            .split('\n') // Split by newlines
            .map((s:string) => s.trim()) // Trim whitespace
            .filter(s => s.length > 0); 
    }catch(error){
        throw new Error(
      `execution failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    }
}