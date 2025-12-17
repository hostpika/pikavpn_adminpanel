export interface OVPNConfig {
  ip: string
  port: string
  protocol: string
}

export interface OVPNValidationResult {
  isValid: boolean
  errors: string[]
  config: OVPNConfig | null
}

export function parseOVPNFile(content: string): OVPNValidationResult {
  const errors: string[] = []
  const lines = content.split("\n")
  let ip = ""
  let port = "1194" // Default port
  let protocol = "UDP" // Default protocol

  // Validation flags
  let hasClient = false
  let hasDev = false
  let hasProto = false
  let hasRemote = false
  let hasCA = false

  // Check for CA block (simple check)
  if (content.includes("<ca>") && content.includes("</ca>")) {
    hasCA = true
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";")) {
      continue
    }

    const parts = trimmed.split(/\s+/)
    const directive = parts[0].toLowerCase()

    if (directive === "client") {
      hasClient = true
    }

    if (directive === "dev") {
      hasDev = true
    }

    // Parse remote directive (remote <host> [port] [proto])
    if (directive === "remote") {
      hasRemote = true
      if (parts.length >= 2) {
        ip = parts[1]
      }
      if (parts.length >= 3) {
        port = parts[2]
      }
      if (parts.length >= 4) {
        protocol = parts[3].toUpperCase()
      }
    }

    // Parse proto directive
    if (directive === "proto") {
      hasProto = true
      if (parts.length >= 2) {
        protocol = parts[1].toUpperCase().replace("UDP6", "UDP").replace("TCP6", "TCP")
      }
    }

    // Parse port directive (override if processed after remote)
    if (directive === "port") {
      if (parts.length >= 2) {
        port = parts[1]
      }
    }

    // Alternative CA check (external file reference)
    if (directive === "ca") {
      hasCA = true
    }
  }

  // Validate required directives
  // Note: 'client' directive is standard for client configs but some custom configs might omit it.
  // We'll enforce 'remote' as it's absolutely necessary for a server connection.
  if (!hasRemote) {
    errors.push("Missing 'remote' directive (server address)")
  }

  if (!hasCA) {
    errors.push("Missing CA certificate (<ca> block or 'ca' directive)")
  }

  // dev and proto are strictly required by OpenVPN but might be defaulted in some clients
  // We'll warn but maybe strictly require to avoid ambiguity
  if (!hasDev) {
    errors.push("Missing 'dev' directive (e.g., 'dev tun')")
  }

  if (!hasProto && !hasRemote) {
    // If proto isn't specified in its own line OR in remote, default is usually UDP but good to be explicit
    // We won't error here as we default to UDP, but it's good practice
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      config: null
    }
  }

  return {
    isValid: true,
    errors: [],
    config: { ip, port, protocol }
  }
}
