export interface ParsedUserAgent {
  ua: string
  browser: {
    name: string
    version: string
    major: string
  }
  engine: {
    name: string
    version: string
  }
  os: {
    name: string
    version: string
  }
  device: {
    type: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot / Crawler' | 'Unknown'
    vendor: string
    model: string
  }
  cpu: {
    architecture: string
  }
  isBot: boolean
  botName?: string
}

export function parseUserAgent(uaString: string): ParsedUserAgent {
  const ua = uaString.trim()

  // 1. Bot Detection
  const botPatterns: [RegExp, string][] = [
    [/Googlebot/i, 'Googlebot (Google Search)'],
    [/bingbot/i, 'Bingbot (Microsoft Bing)'],
    [/Baiduspider/i, 'Baiduspider (Baidu Search)'],
    [/YandexBot/i, 'YandexBot (Yandex Search)'],
    [/DuckDuckBot/i, 'DuckDuckBot (DuckDuckGo)'],
    [/Twitterbot/i, 'Twitterbot (Twitter / X preview)'],
    [/facebookexternalhit/i, 'Facebook External Hit (Meta)'],
    [/LinkedInBot/i, 'LinkedInBot (LinkedIn)'],
    [/Discordbot/i, 'Discordbot (Discord link preview)'],
    [/TelegramBot/i, 'TelegramBot (Telegram preview)'],
    [/ChatGPT-User|GPTBot/i, 'GPTBot / OpenAI Crawler'],
    [/curl\//i, 'cURL HTTP Client'],
    [/PostmanRuntime/i, 'Postman API Client'],
    [/Wget/i, 'Wget Downloader'],
  ]

  let isBot = false
  let botName: string | undefined

  for (const [regex, name] of botPatterns) {
    if (regex.test(ua)) {
      isBot = true
      botName = name
      break
    }
  }

  // 2. Browser Detection
  let browserName = 'Unknown Browser'
  let browserVersion = '0.0.0'

  if (/Edg(?:e|A|iOS)?\/([0-9.]+)/i.test(ua)) {
    browserName = 'Microsoft Edge'
    browserVersion = ua.match(/Edg(?:e|A|iOS)?\/([0-9.]+)/i)?.[1] || '0.0.0'
  } else if (/OPR\/([0-9.]+)|Opera\/([0-9.]+)/i.test(ua)) {
    browserName = 'Opera'
    browserVersion = ua.match(/OPR\/([0-9.]+)|Opera\/([0-9.]+)/i)?.[1] || '0.0.0'
  } else if (/SamsungBrowser\/([0-9.]+)/i.test(ua)) {
    browserName = 'Samsung Internet'
    browserVersion = ua.match(/SamsungBrowser\/([0-9.]+)/i)?.[1] || '0.0.0'
  } else if (/Brave\/([0-9.]+)/i.test(ua)) {
    browserName = 'Brave'
    browserVersion = ua.match(/Brave\/([0-9.]+)/i)?.[1] || '0.0.0'
  } else if (/Chrome\/([0-9.]+)/i.test(ua) && !/Chromium/i.test(ua)) {
    browserName = 'Google Chrome'
    browserVersion = ua.match(/Chrome\/([0-9.]+)/i)?.[1] || '0.0.0'
  } else if (/Version\/([0-9.]+).*Safari/i.test(ua)) {
    browserName = 'Apple Safari'
    browserVersion = ua.match(/Version\/([0-9.]+)/i)?.[1] || '0.0.0'
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browserName = 'Mozilla Firefox'
    browserVersion = ua.match(/Firefox\/([0-9.]+)/i)?.[1] || '0.0.0'
  } else if (isBot && botName) {
    browserName = botName
    browserVersion = 'Bot'
  }

  const browserMajor = browserVersion.split('.')[0] || '0'

  // 3. Engine Detection
  let engineName = 'Unknown Engine'
  let engineVersion = ''
  if (/AppleWebKit\/([0-9.]+)/i.test(ua)) {
    engineName = /Chrome/i.test(ua) || /Edg/i.test(ua) ? 'Blink' : 'WebKit'
    engineVersion = ua.match(/AppleWebKit\/([0-9.]+)/i)?.[1] || ''
  } else if (/Gecko\/([0-9.]+)/i.test(ua)) {
    engineName = 'Gecko'
    engineVersion = ua.match(/rv:([0-9.]+)/i)?.[1] || ''
  } else if (/Trident\/([0-9.]+)/i.test(ua)) {
    engineName = 'Trident'
    engineVersion = ua.match(/Trident\/([0-9.]+)/i)?.[1] || ''
  }

  // 4. OS Detection
  let osName = 'Unknown OS'
  let osVersion = ''

  if (/Windows NT 10.0/i.test(ua)) {
    osName = 'Windows'
    osVersion = '10 / 11'
  } else if (/Windows NT 6.3/i.test(ua)) {
    osName = 'Windows'
    osVersion = '8.1'
  } else if (/Windows NT 6.1/i.test(ua)) {
    osName = 'Windows'
    osVersion = '7'
  } else if (/iPhone OS ([0-9_]+)/i.test(ua)) {
    osName = 'iOS'
    osVersion = (ua.match(/iPhone OS ([0-9_]+)/i)?.[1] || '').replace(/_/g, '.')
  } else if (/iPad.*OS ([0-9_]+)/i.test(ua)) {
    osName = 'iPadOS'
    osVersion = (ua.match(/OS ([0-9_]+)/i)?.[1] || '').replace(/_/g, '.')
  } else if (/Mac OS X ([0-9_.]+)/i.test(ua)) {
    osName = 'macOS'
    osVersion = (ua.match(/Mac OS X ([0-9_.]+)/i)?.[1] || '').replace(/_/g, '.')
  } else if (/Android ([0-9.]+)/i.test(ua)) {
    osName = 'Android'
    osVersion = ua.match(/Android ([0-9.]+)/i)?.[1] || ''
  } else if (/Ubuntu/i.test(ua)) {
    osName = 'Ubuntu Linux'
  } else if (/Linux/i.test(ua)) {
    osName = 'Linux'
  } else if (/CrOS/i.test(ua)) {
    osName = 'ChromeOS'
  }

  // 5. Device Type
  let deviceType: ParsedUserAgent['device']['type'] = 'Desktop'
  let vendor = 'Generic'
  let model = ''

  if (isBot) {
    deviceType = 'Bot / Crawler'
    vendor = 'Bot'
  } else if (/iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    deviceType = 'Tablet'
    vendor = /iPad/i.test(ua) ? 'Apple' : 'Android Tablet'
  } else if (/iPhone|iPod/i.test(ua) || (/Android/i.test(ua) && /Mobile/i.test(ua))) {
    deviceType = 'Mobile'
    vendor = /iPhone/i.test(ua) ? 'Apple' : 'Android Mobile'
    if (/iPhone/i.test(ua)) model = 'iPhone'
  }

  // 6. CPU Architecture
  let cpuArch = 'x86_64'
  if (/ARM64|aarch64|iPhone|iPad/i.test(ua)) {
    cpuArch = 'ARM64 (Apple Silicon / ARM)'
  } else if (/Win64|x64|x86_64|WOW64/i.test(ua)) {
    cpuArch = 'x86_64 (64-bit Intel/AMD)'
  } else if (/i686|i386|x86/i.test(ua)) {
    cpuArch = 'x86 (32-bit)'
  }

  return {
    ua,
    browser: {
      name: browserName,
      version: browserVersion,
      major: browserMajor,
    },
    engine: {
      name: engineName,
      version: engineVersion,
    },
    os: {
      name: osName,
      version: osVersion,
    },
    device: {
      type: deviceType,
      vendor,
      model,
    },
    cpu: {
      architecture: cpuArch,
    },
    isBot,
    botName,
  }
}
