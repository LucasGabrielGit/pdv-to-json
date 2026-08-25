export interface FluidClampParams {
  minFontSize: number // in px (e.g. 16)
  maxFontSize: number // in px (e.g. 32)
  minViewport: number // in px (e.g. 375 or 640)
  maxViewport: number // in px (e.g. 1280 or 1536)
  rootFontSize: number // in px (e.g. 16)
  unit: 'rem' | 'px'
}

export interface FluidClampResult {
  clampCss: string
  tailwindClass: string
  minRem: number
  maxRem: number
  slopeVw: number
  interceptRem: number
  cssRule: string
}

export function calculateFluidClamp(params: FluidClampParams): FluidClampResult {
  const {
    minFontSize,
    maxFontSize,
    minViewport,
    maxViewport,
    rootFontSize = 16,
  } = params

  const minFont = Math.max(1, minFontSize)
  const maxFont = Math.max(minFont, maxFontSize)
  const minVp = Math.max(100, minViewport)
  const maxVp = Math.max(minVp + 10, maxViewport)
  const root = Math.max(1, rootFontSize)

  // Slope formula: rate of change
  const slope = (maxFont - minFont) / (maxVp - minVp)
  const slopeVw = Number((slope * 100).toFixed(4))

  // Intercept formula in px
  const interceptPx = -minVp * slope + minFont
  const interceptRem = Number((interceptPx / root).toFixed(4))

  const minRem = Number((minFont / root).toFixed(4))
  const maxRem = Number((maxFont / root).toFixed(4))

  const sign = interceptRem >= 0 ? '+' : '-'
  const absIntercept = Math.abs(interceptRem)

  const preferred =
    absIntercept === 0
      ? `${slopeVw}vw`
      : `${interceptRem}rem ${sign} ${slopeVw}vw`

  const clampCss = `clamp(${minRem}rem, ${preferred}, ${maxRem}rem)`
  const cleanTailwindPreferred =
    absIntercept === 0
      ? `${slopeVw}vw`
      : `${interceptRem}rem${sign}${slopeVw}vw`
  const tailwindClass = `text-[clamp(${minRem}rem,${cleanTailwindPreferred},${maxRem}rem)]`

  const cssRule = `/* Fluid Responsive Typography */
font-size: ${clampCss};

/* Fallback for legacy browsers */
@media (max-width: ${minVp}px) {
  font-size: ${minRem}rem;
}
@media (min-width: ${maxVp}px) {
  font-size: ${maxRem}rem;
}`

  return {
    clampCss,
    tailwindClass,
    minRem,
    maxRem,
    slopeVw,
    interceptRem,
    cssRule,
  }
}

export interface UnitConversions {
  px: number
  rem: number
  em: number
  vw: number
  vh: number
  pt: number
  percentage: number
}

export function convertUnits(
  val: number,
  fromUnit: 'px' | 'rem' | 'em' | 'vw' | 'vh' | 'pt',
  rootFontSize: number = 16,
  viewportWidth: number = 1440,
  viewportHeight: number = 900
): UnitConversions {
  let px = 0

  switch (fromUnit) {
    case 'px':
      px = val
      break
    case 'rem':
    case 'em':
      px = val * rootFontSize
      break
    case 'vw':
      px = (val * viewportWidth) / 100
      break
    case 'vh':
      px = (val * viewportHeight) / 100
      break
    case 'pt':
      px = val * (96 / 72)
      break
  }

  return {
    px: Number(px.toFixed(2)),
    rem: Number((px / rootFontSize).toFixed(4)),
    em: Number((px / rootFontSize).toFixed(4)),
    vw: Number(((px / viewportWidth) * 100).toFixed(4)),
    vh: Number(((px / viewportHeight) * 100).toFixed(4)),
    pt: Number((px * (72 / 96)).toFixed(2)),
    percentage: Number(((px / rootFontSize) * 100).toFixed(2)),
  }
}
