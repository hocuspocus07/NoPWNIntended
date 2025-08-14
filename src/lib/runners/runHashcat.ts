import { spawn } from "child_process";
type HashType =
  | "auto"
  | "ntlm"
  | "sha256"
  | "sha512"
  | "wpa"
  | "django"
  | "sha512crypt";
type AttackMode =
  | "straight"
  | "combination"
  | "brute"
  | "hybrid_wm"
  | "hybrid_mw";
type WorkloadProfile = "1" | "2" | "3" | "4";


export async function runHashcat(
  hash: string,
  hashType: HashType,
  wordlist: string,
  attackMode: AttackMode,
  workload: WorkloadProfile = "3",
): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if(!container)return "no container"
  const args = [
    "/docker/scripts/run-hashcat.sh",
    hash,
    hashType,
    wordlist,
    attackMode,
    workload,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn("docker", ["exec", container, ...args]);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Hashcat execution failed: ${stderr || stdout}`));
      }
    });
    proc.on("error", (err) => {
      reject(new Error(`Failed to start hashcat process: ${err.message}`));
    });
  });
}
