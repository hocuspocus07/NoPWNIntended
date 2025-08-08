import { spawn } from "child_process"

type StartArgs = {
  fileContent: Buffer
  fileName: string
  userId?: string
  containerName?: string
}

type ConnectionStatus = {
  connected: boolean
  startTime?: number
  timeRemaining?: number
  fileName?: string
}

export async function runOpenVPN({
  fileContent,
  fileName,
  userId,
  containerName,
}: StartArgs): Promise<string> {
  const container =
    containerName ||
    process.env.NEXT_PUBLIC_CONTAINER_NAME
  if (!container) throw new Error("OPENVPN_DOCKER_CONTAINER not defined")

  const safeId = (userId || "anon")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 24) || "anon"
  const configPath = `/tmp/ovpn-${safeId}.ovpn`
  const pidPath = `/var/run/openvpn-${safeId}.pid`
  const logPath = `/var/log/openvpn-${safeId}.log`
  const statusPath = `/tmp/ovpn-status-${safeId}.json`

  // 1) writes the config to /tmp
  // 2) ensures run/log dirs exist
  // 3) validates that openvpn exists and /dev/net/tun is present
  // 4) launches openvpn as a daemon so docker exec returns immediately
  // 5) creates a status file with connection info
  // 6) sets up auto-disconnect after 1 hour
  const startTime = Date.now()
  const sh = `
set -e
CONFIG="${configPath}"
PID="${pidPath}"
LOG="${logPath}"
STATUS="${statusPath}"
START_TIME="${startTime}"
FILENAME="${fileName}"

mkdir -p /var/run /var/log /tmp
cat > "$CONFIG"

if ! command -v openvpn >/dev/null 2>&1; then
  echo "openvpn binary not found in container" >&2
  exit 90
fi
if [ ! -e /dev/net/tun ]; then
  echo "/dev/net/tun not available in container" >&2
  exit 91
fi

# Create status file
cat > "$STATUS" << EOF
{
  "connected": true,
  "startTime": $START_TIME,
  "fileName": "$FILENAME",
  "userId": "${safeId}"
}
EOF

# Start as daemon with a unique name/pid/log per user
openvpn --config "$CONFIG" --daemon "openvpn-${safeId}" --writepid "$PID" --log "$LOG"

# Give it a moment to start and write the pid
sleep 0.5
if [ ! -f "$PID" ]; then
  echo "OpenVPN did not write pid file: $PID" >&2
  rm -f "$STATUS"
  exit 92
fi

# Set up auto-disconnect after 1 hour (3600 seconds) in background
(
  sleep 3600
  if [ -f "$PID" ]; then
    kill \$(cat "$PID") 2>/dev/null || true
    rm -f "$PID" "$STATUS" "$CONFIG"
    echo "Auto-disconnected OpenVPN for ${safeId} after 1 hour" >> "$LOG"
  fi
) &

echo "OpenVPN started for ${safeId} with 1-hour auto-disconnect"
`

  return new Promise<string>((resolve, reject) => {
    const proc = spawn(
      "docker",
      ["exec", "-i", container, "sh", "-c", sh],
      { stdio: ["pipe", "pipe", "pipe"] }
    )

    let stdout = ""
    let stderr = ""

    proc.stdout.on("data", (d) => {
      stdout += d.toString()
    })
    proc.stderr.on("data", (d) => {
      stderr += d.toString()
    })
    proc.on("error", (err) => {
      reject(new Error(`Failed to start process: ${err.message}`))
    })
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(
          `OpenVPN started for ${safeId}. PID/log in container: ${pidPath} / ${logPath}. Auto-disconnect in 1 hour.`
        )
      } else {
        reject(new Error(humanizeOpenVpnError(stderr, code ?? -1, container)))
      }
    })

    // stream the file content into "cat > $CONFIG"
    proc.stdin.write(fileContent)
    proc.stdin.end()
  })
}

export async function disconnectOpenVPN(userId: string): Promise<string> {
  const container =
    process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if (!container) throw new Error("CONTAINER_NAME not defined")

  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "anon"
  const pidPath = `/var/run/openvpn-${safeId}.pid`
  const statusPath = `/tmp/ovpn-status-${safeId}.json`
  const configPath = `/tmp/ovpn-${safeId}.ovpn`

  const sh = `
set -e
PID="${pidPath}"
STATUS="${statusPath}"
CONFIG="${configPath}"

if [ -f "$PID" ]; then
  kill \$(cat "$PID") 2>/dev/null || true
  rm -f "$PID" "$STATUS" "$CONFIG"
  echo "OpenVPN disconnected for ${safeId}"
else
  rm -f "$STATUS" "$CONFIG"
  echo "No active OpenVPN process found for ${safeId}"
fi
`

  return new Promise<string>((resolve, reject) => {
    const proc = spawn("docker", ["exec", "-i", container, "sh", "-c", sh])

    let stdout = ""
    let stderr = ""

    proc.stdout.on("data", (d) => {
      stdout += d.toString()
    })
    proc.stderr.on("data", (d) => {
      stderr += d.toString()
    })
    proc.on("error", (err) => {
      reject(new Error(`Failed to disconnect: ${err.message}`))
    })
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim() || "Disconnected successfully")
      } else {
        reject(new Error(`Disconnect failed: ${stderr}`))
      }
    })
  })
}

export async function getConnectionStatus(userId: string): Promise<ConnectionStatus> {
  const container =
    process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if (!container) throw new Error("CONTAINER_NAME not defined")

  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "anon"
  const pidPath = `/var/run/openvpn-${safeId}.pid`
  const statusPath = `/tmp/ovpn-status-${safeId}.json`

  const sh = `
set -e
PID="${pidPath}"
STATUS="${statusPath}"

if [ -f "$PID" ] && [ -f "$STATUS" ]; then
  # Check if process is still running
  if kill -0 \$(cat "$PID") 2>/dev/null; then
    cat "$STATUS"
  else
    # Process died, clean up
    rm -f "$PID" "$STATUS"
    echo '{"connected": false}'
  fi
else
  echo '{"connected": false}'
fi
`

  return new Promise<ConnectionStatus>((resolve, reject) => {
    const proc = spawn("docker", ["exec", "-i", container, "sh", "-c", sh])

    let stdout = ""
    let stderr = ""

    proc.stdout.on("data", (d) => {
      stdout += d.toString()
    })
    proc.stderr.on("data", (d) => {
      stderr += d.toString()
    })
    proc.on("error", (err) => {
      reject(new Error(`Failed to get status: ${err.message}`))
    })
    proc.on("close", (code) => {
      if (code === 0) {
        try {
          const status = JSON.parse(stdout.trim())
          if (status.connected && status.startTime) {
            const elapsed = Date.now() - status.startTime
            const remaining = Math.max(0, 3600000 - elapsed) // 1 hour in ms
            status.timeRemaining = remaining
            
            // If time expired, mark as disconnected
            if (remaining <= 0) {
              status.connected = false
            }
          }
          resolve(status)
        } catch (parseError) {
          resolve({ connected: false })
        }
      } else {
        resolve({ connected: false })
      }
    })
  })
}

function humanizeOpenVpnError(stderr: string, code: number, container: string) {
  const s = stderr || ""
  if (s.includes("/dev/net/tun not available")) {
    return [
      `OpenVPN failed: /dev/net/tun is not available in container "${container}".`,
      `Start your container with: --cap-add=NET_ADMIN --device /dev/net/tun`,
      `Example: docker run --cap-add=NET_ADMIN --device /dev/net/tun ...`,
    ].join(" ")
  }
  if (s.match(/(Cannot open TUN|Operation not permitted)/i)) {
    return [
      `OpenVPN failed to open TUN device (permission).`,
      `Ensure the container has NET_ADMIN and /dev/net/tun.`,
      `stderr: ${trimTail(s, 10)}`,
    ].join(" ")
  }
  if (s.includes("openvpn binary not found")) {
    return [
      `OpenVPN not installed in container "${container}".`,
      `Install it (e.g. apk add openvpn or apt-get install -y openvpn).`,
    ].join(" ")
  }
  if (s.includes("Options error")) {
    return [
      `OpenVPN options error:`,
      trimTail(s, 10),
    ].join(" ")
  }
  return `OpenVPN start failed with code ${code}: ${trimTail(s, 10)}`
}

function trimTail(text: string, lines = 10) {
  const parts = text.trim().split("\n")
  return parts.slice(Math.max(0, parts.length - lines)).join("\n")
}
