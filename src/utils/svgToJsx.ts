/**
 * Options for converting SVG to JSX/React component
 */
export interface SvgToJsxOptions {
  componentName: string
  isTypeScript: boolean
  isMemo: boolean
  isForwardRef: boolean
  replaceColorsWithCurrentColor: boolean
  addPropsSpread: boolean
}

/**
 * Attribute name mapping from SVG/HTML kebab-case to React camelCase
 */
const ATTR_MAP: Record<string, string> = {
  class: 'className',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'text-anchor': 'textAnchor',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace',
  xmlns: 'xmlns',
  'xmlns:xlink': 'xmlnsXlink',
}

/**
 * Converts raw SVG code into a clean, modern React component
 */
export function convertSvgToJsx(
  rawSvg: string,
  options: Partial<SvgToJsxOptions> = {}
): { jsx: string; error?: string } {
  if (!rawSvg || !rawSvg.trim()) {
    return { jsx: '' }
  }

  const {
    componentName = 'SvgIcon',
    isTypeScript = true,
    isMemo = false,
    isForwardRef = false,
    replaceColorsWithCurrentColor = false,
    addPropsSpread = true,
  } = options

  try {
    let clean = rawSvg.trim()

    // Remove XML declarations and comments
    clean = clean.replace(/<\?xml[^>]*\?>/gi, '')
    clean = clean.replace(/<!--[\s\S]*?-->/gi, '')
    clean = clean.replace(/<!DOCTYPE[^>]*>/gi, '')

    // Replace SVG attribute names with React camelCase
    Object.entries(ATTR_MAP).forEach(([kebab, camel]) => {
      const regex = new RegExp(`\\b${kebab}=`, 'gi')
      clean = clean.replace(regex, `${camel}=`)
    })

    // Handle inline style attributes style="..." -> style={{ ... }}
    clean = clean.replace(/style="([^"]*)"/gi, (_, styleStr: string) => {
      const styles = styleStr
        .split(';')
        .filter((s) => s.trim())
        .map((s) => {
          const [key, val] = s.split(':').map((p) => p.trim())
          if (!key || !val) return null
          const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
          return `${camelKey}: "${val}"`
        })
        .filter(Boolean)
        .join(', ')

      return `style={{ ${styles} }}`
    })

    // Optionally replace fill and stroke hex/rgb colors with 'currentColor'
    if (replaceColorsWithCurrentColor) {
      clean = clean.replace(/fill="(?!none)[^"]+"/gi, 'fill="currentColor"')
      clean = clean.replace(/stroke="(?!none)[^"]+"/gi, 'stroke="currentColor"')
    }

    // Add {...props} to the root <svg> tag if requested
    if (addPropsSpread) {
      clean = clean.replace(/<svg\b([^>]*)>/i, '<svg $1 {...props}>')
    }

    // Format indentation of inner SVG
    const formattedSvg = clean
      .split('\n')
      .map((line) => '    ' + line.trim())
      .join('\n')

    const typeProps = isTypeScript
      ? ': React.SVGProps<SVGSVGElement>'
      : ''

    let componentCode = ''

    if (isForwardRef) {
      const typeGeneric = isTypeScript ? '<SVGSVGElement, React.SVGProps<SVGSVGElement>>' : ''
      componentCode = `import * as React from 'react'

export const ${componentName} = React.forwardRef${typeGeneric}((props, ref) => {
  return (
${formattedSvg.replace('<svg ', '<svg ref={ref} ')}
  )
})

${componentName}.displayName = '${componentName}'
`
    } else {
      componentCode = `import * as React from 'react'

export function ${componentName}(props${typeProps}) {
  return (
${formattedSvg}
  )
}
`
    }

    if (isMemo) {
      componentCode += `\nexport default React.memo(${componentName})\n`
    } else {
      componentCode += `\nexport default ${componentName}\n`
    }

    return { jsx: componentCode }
  } catch (err) {
    return {
      jsx: '',
      error: `Failed to convert SVG to JSX: ${(err as Error).message}`,
    }
  }
}
