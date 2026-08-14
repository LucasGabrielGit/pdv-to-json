/**
 * Lightweight, zero-dependency MD5 Implementation for browser environments
 */
function md5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))
  }

  function addUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000
    const lY4 = lY & 0x40000000
    const lX8 = lX & 0x80000000
    const lY8 = lY & 0x80000000
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff)
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX4 ^ lY4
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX4 ^ lY4
      else return lResult ^ 0x40000000 ^ lX4 ^ lY4
    } else return lResult ^ lX4 ^ lY4
  }

  function F(x: number, y: number, z: number) {
    return (x & y) | (~x & z)
  }
  function G(x: number, y: number, z: number) {
    return (x & z) | (y & ~z)
  }
  function H(x: number, y: number, z: number) {
    return x ^ y ^ z
  }
  function I(x: number, y: number, z: number) {
    return y ^ (x | ~z)
  }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function convertToWordArray(string: string) {
    let lMessageLength = string.length
    let lNumberOfWords_temp1 = lMessageLength + 8
    let lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64
    let lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16
    let lWordArray = Array(lNumberOfWords - 1)
    let lBytePosition = 0
    let lByteCount = 0
    let lWordPosition = 0
    while (lByteCount < lMessageLength) {
      lWordPosition = (lByteCount - (lByteCount % 4)) / 4
      lBytePosition = (lByteCount % 4) * 8
      lWordArray[lWordPosition] =
        lWordArray[lWordPosition] | (string.charCodeAt(lByteCount) << lBytePosition)
      lByteCount++
    }
    lWordPosition = (lByteCount - (lByteCount % 4)) / 4
    lBytePosition = (lByteCount % 4) * 8
    lWordArray[lWordPosition] = lWordArray[lWordPosition] | (0x80 << lBytePosition)
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29
    return lWordArray
  }

  function wordToHex(lValue: number) {
    let WordToHexValue = '',
      WordToHexValue_temp = '',
      lByte,
      lCount
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255
      WordToHexValue_temp = '0' + lByte.toString(16)
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2)
    }
    return WordToHexValue
  }

  function utf8Encode(string: string) {
    string = string.replace(/\r\n/g, '\n')
    let utftext = ''
    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n)
      if (c < 128) {
        utftext += String.fromCharCode(c)
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192)
        utftext += String.fromCharCode((c & 63) | 128)
      } else {
        utftext += String.fromCharCode((c >> 12) | 224)
        utftext += String.fromCharCode(((c >> 6) & 63) | 128)
        utftext += String.fromCharCode((c & 63) | 128)
      }
    }
    return utftext
  }

  let x = convertToWordArray(utf8Encode(string))
  let a = 0x67452301,
    b = 0xefcdab89,
    c = 0x98badcfe,
    d = 0x10325476
  const S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22
  const S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20
  const S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23
  const S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21

  for (let k = 0; k < x.length; k += 16) {
    let AA = a,
      BB = b,
      CC = c,
      DD = d
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478)
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756)
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db)
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee)
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf)
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a)
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613)
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501)
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8)
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af)
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1)
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be)
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122)
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193)
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e)
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821)
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562)
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340)
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51)
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa)
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d)
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453)
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681)
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8)
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6)
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6)
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87)
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed)
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905)
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8)
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9)
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a)
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942)
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681)
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122)
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c)
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44)
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9)
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60)
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70)
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6)
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa)
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085)
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05)
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039)
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5)
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8)
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665)
    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244)
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97)
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7)
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039)
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3)
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92)
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d)
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1)
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f)
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0)
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314)
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1)
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82)
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235)
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb)
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391)
    a = addUnsigned(a, AA)
    b = addUnsigned(b, BB)
    c = addUnsigned(c, CC)
    d = addUnsigned(d, DD)
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase()
}

export interface GeneratedHashes {
  sha256: string
  sha512: string
  sha384: string
  sha1: string
  md5: string
  executionTimeMs: number
}

/**
 * Computes Web Crypto API digest for ArrayBuffer
 */
async function computeSubtleHash(algo: 'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1', buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algo, buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generates SHA-256, SHA-512, SHA-384, SHA-1, and MD5 hashes for text input
 */
export async function generateTextHashes(text: string): Promise<GeneratedHashes> {
  if (!text) {
    return { sha256: '', sha512: '', sha384: '', sha1: '', md5: '', executionTimeMs: 0 }
  }

  const startTime = performance.now()
  const encoder = new TextEncoder()
  const buffer = encoder.encode(text).buffer as ArrayBuffer

  const [sha256, sha512, sha384, sha1] = await Promise.all([
    computeSubtleHash('SHA-256', buffer),
    computeSubtleHash('SHA-512', buffer),
    computeSubtleHash('SHA-384', buffer),
    computeSubtleHash('SHA-1', buffer),
  ])

  const md5Hash = md5(text)
  const endTime = performance.now()

  return {
    sha256,
    sha512,
    sha384,
    sha1,
    md5: md5Hash,
    executionTimeMs: parseFloat((endTime - startTime).toFixed(3)),
  }
}

/**
 * Generates hashes for a File object
 */
export async function generateFileHashes(file: File): Promise<GeneratedHashes> {
  const startTime = performance.now()
  const buffer = await file.arrayBuffer()

  const [sha256, sha512, sha384, sha1] = await Promise.all([
    computeSubtleHash('SHA-256', buffer),
    computeSubtleHash('SHA-512', buffer),
    computeSubtleHash('SHA-384', buffer),
    computeSubtleHash('SHA-1', buffer),
  ])

  // MD5 calculation for file bytes
  const bytes = new Uint8Array(buffer)
  let binaryStr = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryStr += String.fromCharCode(bytes[i])
  }
  const md5Hash = md5(binaryStr)

  const endTime = performance.now()

  return {
    sha256,
    sha512,
    sha384,
    sha1,
    md5: md5Hash,
    executionTimeMs: parseFloat((endTime - startTime).toFixed(3)),
  }
}
