import { spawn } from "child_process";

export async function runOpenVPN(fileContent: Buffer, fileName: string) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if (!container) throw new Error("Docker container name not defined");

  const tempContainerPath = `/tmp/${fileName}`;

  return new Promise<string>((resolve, reject) => {
    const proc = spawn("docker", [
      "exec",
      "-i",
      container,
      "bash",
      "-c",
      `cat > ${tempContainerPath} && /docker/scripts/run-openvpn.sh ${tempContainerPath}`,
    ]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to start process: ${err.message}`));
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`OpenVPN start failed with code ${code}: ${stderr}`));
      }
    });

    proc.stdin.write(fileContent);
    proc.stdin.end();
  });
}
