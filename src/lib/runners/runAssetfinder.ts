import { exec } from "child_process";
import util from "util"

const asyncExec=util.promisify(exec)

export async function runAssetFinder(domain:string){
    const container=process.env.NEXT_PUBLIC_CONTAINER_NAME
    try{
        const {stdout}=await asyncExec(`docker exec ${container} /docker/scripts/run-assetfinder.sh ${domain}`);
        return stdout;
    }catch(error){
        throw new Error(
      `execution failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    }
}