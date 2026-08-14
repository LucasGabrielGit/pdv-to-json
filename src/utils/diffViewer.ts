import * as Diff from 'diff'

export type DiffMode = 'lines' | 'words' | 'json'

export interface DiffOptions {
  mode?: DiffMode
  ignoreWhitespace?: boolean
  ignoreCase?: boolean
}

export interface DiffLineItem {
  value: string
  added?: boolean
  removed?: boolean
  leftLineNum?: number
  rightLineNum?: number
}

export interface DiffResult {
  changes: Diff.Change[]
  lines: DiffLineItem[]
  additionsCount: number
  deletionsCount: number
  unchangedCount: number
  executionTimeMs: number
}

export const SAMPLE_ORIGINAL_CODE = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`

export const SAMPLE_MODIFIED_CODE = `function calculateTotal(items: Array<{ price: number }>): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + item.price, 0);
}`

/**
 * Computes difference between two texts or JSON strings
 */
export function computeTextDiff(
  originalText: string,
  modifiedText: string,
  options: DiffOptions = {}
): DiffResult {
  const { mode = 'lines', ignoreWhitespace = false, ignoreCase = false } = options

  if (!originalText && !modifiedText) {
    return {
      changes: [],
      lines: [],
      additionsCount: 0,
      deletionsCount: 0,
      unchangedCount: 0,
      executionTimeMs: 0,
    }
  }

  const startTime = performance.now()

  let rawChanges: Diff.Change[] = []

  if (mode === 'json') {
    let objOriginal = {}
    let objModified = {}
    try {
      if (originalText) objOriginal = JSON.parse(originalText)
    } catch {
      objOriginal = { text: originalText }
    }
    try {
      if (modifiedText) objModified = JSON.parse(modifiedText)
    } catch {
      objModified = { text: modifiedText }
    }
    rawChanges = Diff.diffJson(objOriginal, objModified)
  } else if (mode === 'words') {
    rawChanges = Diff.diffWords(originalText, modifiedText, {
      ignoreCase,
    })
  } else {
    // Default: line diff
    rawChanges = Diff.diffLines(originalText, modifiedText, {
      ignoreWhitespace,
    })
  }

  let additionsCount = 0
  let deletionsCount = 0
  let unchangedCount = 0

  const lines: DiffLineItem[] = []
  let leftLineCounter = 1
  let rightLineCounter = 1

  rawChanges.forEach((change) => {
    const splitLines = change.value.split('\n')
    // Remove last empty element caused by trailing newline if present
    if (splitLines.length > 1 && splitLines[splitLines.length - 1] === '') {
      splitLines.pop()
    }

    if (change.added) {
      additionsCount += splitLines.length
      splitLines.forEach((l) => {
        lines.push({
          value: l,
          added: true,
          rightLineNum: rightLineCounter++,
        })
      })
    } else if (change.removed) {
      deletionsCount += splitLines.length
      splitLines.forEach((l) => {
        lines.push({
          value: l,
          removed: true,
          leftLineNum: leftLineCounter++,
        })
      })
    } else {
      unchangedCount += splitLines.length
      splitLines.forEach((l) => {
        lines.push({
          value: l,
          leftLineNum: leftLineCounter++,
          rightLineNum: rightLineCounter++,
        })
      })
    }
  })

  const endTime = performance.now()

  return {
    changes: rawChanges,
    lines,
    additionsCount,
    deletionsCount,
    unchangedCount,
    executionTimeMs: parseFloat((endTime - startTime).toFixed(3)),
  }
}
