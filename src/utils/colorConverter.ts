export interface RgbColor {
  r: number
  g: number
  b: number
  a?: number
}

export interface HslColor {
  h: number
  s: number
  l: number
  a?: number
}

export interface ColorConversionResult {
  isValid: boolean
  hex: string
  rgb: string
  rgba: string
  hsl: string
  hsla: string
  cssVar: string
  rgbValues: RgbColor
  hslValues: HslColor
  contrastRatioWhite: number
  contrastRatioBlack: number
  isWcagWhiteAa: boolean
  isWcagBlackAa: boolean
  shades: string[]
  tints: string[]
}

/**
 * Converts HEX string to RGB object
 */
export function hexToRgb(hexStr: string): RgbColor | null {
  let hex = hexStr.trim().replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('')
  }
  if (hex.length !== 6 && hex.length !== 8) return null

  const num = parseInt(hex, 16)
  if (isNaN(num)) return null

  if (hex.length === 6) {
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: 1,
    }
  }

  return {
    r: (num >> 24) & 255,
    g: (num >> 16) & 255,
    b: (num >> 8) & 255,
    a: parseFloat(((num & 255) / 255).toFixed(2)),
  }
}

/**
 * Converts RGB object to HEX string
 */
export function rgbToHex(rgb: RgbColor): string {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r)))
  const g = Math.max(0, Math.min(255, Math.round(rgb.g)))
  const b = Math.max(0, Math.min(255, Math.round(rgb.b)))

  const hexR = r.toString(16).padStart(2, '0')
  const hexG = g.toString(16).padStart(2, '0')
  const hexB = b.toString(16).padStart(2, '0')

  return `#${hexR}${hexG}${hexB}`.toLowerCase()
}

/**
 * Converts RGB object to HSL object
 */
export function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgb.a ?? 1,
  }
}

/**
 * Calculates relative luminance for WCAG contrast checking
 */
function getLuminance(rgb: RgbColor): number {
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

/**
 * Calculates WCAG 2.1 contrast ratio between two colors
 */
export function getContrastRatio(color1: RgbColor, color2: RgbColor): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return parseFloat(((brightest + 0.05) / (darkest + 0.05)).toFixed(2))
}

/**
 * Generates shades (darker) and tints (lighter) for a color
 */
export function generateShadesAndTints(rgb: RgbColor): { shades: string[]; tints: string[] } {
  const shades: string[] = []
  const tints: string[] = []

  for (let i = 1; i <= 5; i++) {
    const factor = i * 0.15
    // Shade (darken towards black)
    const shadeRgb = {
      r: Math.round(rgb.r * (1 - factor)),
      g: Math.round(rgb.g * (1 - factor)),
      b: Math.round(rgb.b * (1 - factor)),
    }
    shades.push(rgbToHex(shadeRgb))

    // Tint (lighten towards white)
    const tintRgb = {
      r: Math.round(rgb.r + (255 - rgb.r) * factor),
      g: Math.round(rgb.g + (255 - rgb.g) * factor),
      b: Math.round(rgb.b + (255 - rgb.b) * factor),
    }
    tints.push(rgbToHex(tintRgb))
  }

  return { shades, tints }
}

/**
 * Parses any color string (HEX, RGB, HSL) and converts to all formats
 */
export function parseAndConvertColor(input: string): ColorConversionResult {
  const cleanInput = input.trim()
  let rgb: RgbColor | null = null

  // Try parsing HEX
  if (cleanInput.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(cleanInput)) {
    rgb = hexToRgb(cleanInput)
  }

  // Try parsing RGB e.g. rgb(124, 58, 237)
  if (!rgb) {
    const rgbMatch = cleanInput.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i)
    if (rgbMatch) {
      rgb = {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10),
        a: rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1,
      }
    }
  }

  if (!rgb) {
    // Default fallback if invalid input
    return {
      isValid: false,
      hex: '#7c3aed',
      rgb: 'rgb(124, 58, 237)',
      rgba: 'rgba(124, 58, 237, 1)',
      hsl: 'hsl(262, 83%, 58%)',
      hsla: 'hsla(262, 83%, 58%, 1)',
      cssVar: '--color-primary: #7c3aed;',
      rgbValues: { r: 124, g: 58, b: 237 },
      hslValues: { h: 262, s: 83, l: 58 },
      contrastRatioWhite: 4.8,
      contrastRatioBlack: 4.3,
      isWcagWhiteAa: true,
      isWcagBlackAa: true,
      shades: [],
      tints: [],
    }
  }

  const hex = rgbToHex(rgb)
  const hsl = rgbToHsl(rgb)

  const whiteRgb: RgbColor = { r: 255, g: 255, b: 255 }
  const blackRgb: RgbColor = { r: 0, g: 0, b: 0 }

  const contrastWhite = getContrastRatio(rgb, whiteRgb)
  const contrastBlack = getContrastRatio(rgb, blackRgb)

  const { shades, tints } = generateShadesAndTints(rgb)

  return {
    isValid: true,
    hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a ?? 1})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a ?? 1})`,
    cssVar: `--color-primary: ${hex};`,
    rgbValues: rgb,
    hslValues: hsl,
    contrastRatioWhite: contrastWhite,
    contrastRatioBlack: contrastBlack,
    isWcagWhiteAa: contrastWhite >= 4.5,
    isWcagBlackAa: contrastBlack >= 4.5,
    shades,
    tints,
  }
}
