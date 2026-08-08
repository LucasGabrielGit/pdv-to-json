/**
 * Computes CRC16-CCITT (0x1021, init 0xFFFF) required for PIX BR Code payloads.
 */
function crc16(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc = crc << 1
      }
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Generates a valid standard EMV QRCPS (BR Code) static PIX payload string.
 * @param pixKey Raw PIX key (phone, CPF/CNPJ, email, or random key)
 * @param merchantName Name of receiver (max 25 chars)
 * @param merchantCity City of receiver (max 15 chars)
 */
export function generatePixPayload(
  pixKey: string,
  merchantName: string = 'Lucas Gabriel',
  merchantCity: string = 'BRASIL'
): string {
  // Format phone number key to standard international format if 11 digits
  const digitsOnly = pixKey.replace(/\D/g, '')
  const formattedKey = digitsOnly.length === 11 ? `+55${digitsOnly}` : pixKey

  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0')
    return `${id}${len}${value}`
  }

  const gui = formatField('00', 'br.gov.bcb.pix')
  const keyField = formatField('01', formattedKey)
  const merchantAccountInfo = formatField('26', `${gui}${keyField}`)

  const payloadBase = [
    formatField('00', '01'),
    merchantAccountInfo,
    formatField('52', '0000'),
    formatField('53', '986'),
    formatField('58', 'BR'),
    formatField('59', merchantName.slice(0, 25)),
    formatField('60', merchantCity.slice(0, 15)),
    formatField('62', formatField('05', '***')),
    '6304',
  ].join('')

  return `${payloadBase}${crc16(payloadBase)}`
}
