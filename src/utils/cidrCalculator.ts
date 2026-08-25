export interface SubnetResult {
  ip: string
  cidr: number
  netmask: string
  wildcard: string
  networkAddress: string
  broadcastAddress: string
  firstUsableHost: string
  lastUsableHost: string
  totalHosts: number
  usableHosts: number
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E'
  ipScope: 'Private (RFC 1918)' | 'Public' | 'Loopback' | 'Link-Local' | 'Multicast / Reserved'
  binary: {
    ip: string
    netmask: string
    network: string
    broadcast: string
  }
}

// Convert dotted-quad IP to 32-bit unsigned integer
export function ipToInt(ip: string): number {
  const octets = ip.trim().split('.').map(Number)
  if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
    throw new Error('Invalid IPv4 address format. Expected 4 octets between 0 and 255 (e.g. 192.168.1.1).')
  }
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0
}

// Convert 32-bit unsigned integer to dotted-quad string
export function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.')
}

// Format 32-bit unsigned integer into 4 binary octets
export function intToBinaryString(int: number): string {
  const binary = (int >>> 0).toString(2).padStart(32, '0')
  return `${binary.slice(0, 8)}.${binary.slice(8, 16)}.${binary.slice(16, 24)}.${binary.slice(24, 32)}`
}

export function calculateSubnet(ipInput: string, cidrInput: number): SubnetResult {
  let cleanIp = ipInput.trim()
  let cidr = cidrInput

  // Support input formatted as "192.168.1.1/24"
  if (cleanIp.includes('/')) {
    const parts = cleanIp.split('/')
    cleanIp = parts[0]
    const parsedCidr = parseInt(parts[1], 10)
    if (!isNaN(parsedCidr) && parsedCidr >= 0 && parsedCidr <= 32) {
      cidr = parsedCidr
    }
  }

  const ipNum = ipToInt(cleanIp)

  if (cidr < 0 || cidr > 32) {
    throw new Error('CIDR prefix must be between 0 and 32.')
  }

  // Netmask as unsigned 32-bit int
  const maskNum = cidr === 0 ? 0 : (((0xffffffff << (32 - cidr)) >>> 0) & 0xffffffff) >>> 0
  const wildcardNum = (~maskNum) >>> 0

  const networkNum = (ipNum & maskNum) >>> 0
  const broadcastNum = (networkNum | wildcardNum) >>> 0

  const totalHosts = Math.pow(2, 32 - cidr)
  const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalHosts - 2)

  let firstUsableNum = networkNum + 1
  let lastUsableNum = broadcastNum - 1

  if (cidr === 31) {
    firstUsableNum = networkNum
    lastUsableNum = broadcastNum
  } else if (cidr === 32) {
    firstUsableNum = networkNum
    lastUsableNum = networkNum
  }

  // Determine Class
  const firstOctet = (ipNum >>> 24) & 255
  let ipClass: SubnetResult['ipClass'] = 'A'
  if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'B'
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'C'
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'D'
  else if (firstOctet >= 240) ipClass = 'E'

  // Determine Scope (Private vs Public)
  let ipScope: SubnetResult['ipScope'] = 'Public'
  if (
    firstOctet === 10 || // 10.0.0.0/8
    (firstOctet === 172 && (ipNum >>> 16 & 255) >= 16 && (ipNum >>> 16 & 255) <= 31) || // 172.16.0.0/12
    (firstOctet === 192 && (ipNum >>> 16 & 255) === 168) // 192.168.0.0/16
  ) {
    ipScope = 'Private (RFC 1918)'
  } else if (firstOctet === 127) {
    ipScope = 'Loopback'
  } else if (firstOctet === 169 && (ipNum >>> 16 & 255) === 254) {
    ipScope = 'Link-Local'
  } else if (firstOctet >= 224) {
    ipScope = 'Multicast / Reserved'
  }

  return {
    ip: intToIp(ipNum),
    cidr,
    netmask: intToIp(maskNum),
    wildcard: intToIp(wildcardNum),
    networkAddress: intToIp(networkNum),
    broadcastAddress: intToIp(broadcastNum),
    firstUsableHost: intToIp(firstUsableNum),
    lastUsableHost: intToIp(lastUsableNum),
    totalHosts,
    usableHosts,
    ipClass,
    ipScope,
    binary: {
      ip: intToBinaryString(ipNum),
      netmask: intToBinaryString(maskNum),
      network: intToBinaryString(networkNum),
      broadcast: intToBinaryString(broadcastNum),
    },
  }
}
