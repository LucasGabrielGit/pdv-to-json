export type MockFieldType =
  | 'id'
  | 'uuid'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'avatar'
  | 'jobTitle'
  | 'company'
  | 'city'
  | 'country'
  | 'price'
  | 'date'
  | 'boolean'
  | 'status'

export interface MockField {
  name: string
  type: MockFieldType
}

const FIRST_NAMES = ['Alex', 'Emma', 'Liam', 'Sophia', 'Lucas', 'Olivia', 'Ethan', 'Mia', 'Noah', 'Ava', 'Gabriel', 'Isabella']
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Silva', 'Santos', 'Garcia', 'Miller', 'Davis', 'Rodriguez']
const COMPANIES = ['Acme Corp', 'Stripe', 'Vercel', 'Supabase', 'Cyberdyne', 'Initech', 'Massive Dynamic', 'Hooli', 'Pied Piper']
const JOB_TITLES = ['Software Engineer', 'Product Manager', 'UX Designer', 'DevOps Architect', 'Data Scientist', 'CTO', 'Frontend Developer']
const CITIES = ['San Francisco', 'New York', 'São Paulo', 'London', 'Tokyo', 'Berlin', 'Toronto', 'Sydney', 'Paris', 'Austin']
const COUNTRIES = ['United States', 'Brazil', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Japan', 'France']
const STATUSES = ['active', 'pending', 'verified', 'suspended', 'completed']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRandomValue(type: MockFieldType, index: number): unknown {
  switch (type) {
    case 'id':
      return index + 1
    case 'uuid':
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    case 'firstName':
      return randomItem(FIRST_NAMES)
    case 'lastName':
      return randomItem(LAST_NAMES)
    case 'fullName':
      return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`
    case 'email': {
      const f = randomItem(FIRST_NAMES).toLowerCase()
      const l = randomItem(LAST_NAMES).toLowerCase()
      const rand = Math.floor(Math.random() * 99)
      return `${f}.${l}${rand}@example.com`
    }
    case 'phone':
      return `+1 (${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`
    case 'avatar':
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${randomItem(FIRST_NAMES)}`
    case 'jobTitle':
      return randomItem(JOB_TITLES)
    case 'company':
      return randomItem(COMPANIES)
    case 'city':
      return randomItem(CITIES)
    case 'country':
      return randomItem(COUNTRIES)
    case 'price':
      return parseFloat((Math.random() * 500 + 10).toFixed(2))
    case 'date': {
      const d = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365))
      return d.toISOString().split('T')[0]
    }
    case 'boolean':
      return Math.random() > 0.5
    case 'status':
      return randomItem(STATUSES)
  }
}

/**
 * Generates mock data rows based on user defined schema
 */
export function generateMockDataset(fields: MockField[], count: number = 10): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = []
  for (let i = 0; i < count; i++) {
    const row: Record<string, unknown> = {}
    fields.forEach((f) => {
      row[f.name] = generateRandomValue(f.type, i)
    })
    rows.push(row)
  }
  return rows
}

/**
 * Formats dataset as SQL INSERT statements
 */
export function exportToSqlInserts(tableName: string, rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const columns = Object.keys(rows[0])
  const colList = columns.join(', ')

  const valueRows = rows.map((r) => {
    const vals = columns.map((col) => {
      const v = r[col]
      if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
      if (v === null || v === undefined) return 'NULL'
      return v
    })
    return `  (${vals.join(', ')})`
  })

  return `INSERT INTO ${tableName || 'users'} (${colList})\nVALUES\n${valueRows.join(',\n')};`
}
