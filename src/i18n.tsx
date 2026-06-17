/**
 * Pure frontend i18n system
 * - No backend routing
 * - navigator.language auto-detection
 * - Dynamic meta title/description for SEO
 * - localStorage persistence
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { translations } from './translations'

// ============ Supported Languages ============
export interface LangDef {
  code: string
  name: string       // Native name
  flag: string
  dir?: 'ltr' | 'rtl'
}

export const LANGUAGES: LangDef[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
]

const STORAGE_KEY = 'mathgame_lang'
const DEFAULT_LANG = 'en'

// ============ Language Detection ============
function detectLanguage(): string {
  // 1. URL query param (?lang=xx) — highest priority for SEO/sharing
  try {
    const urlLang = new URLSearchParams(window.location.search).get('lang')
    if (urlLang && translations[urlLang]) return urlLang
  } catch {}

  // 2. localStorage saved preference
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && translations[saved]) return saved
  } catch {}

  // 3. Browser language (navigator.language / navigator.languages)
  const browserLangs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const bl of browserLangs) {
    const short = bl.slice(0, 2).toLowerCase()
    if (translations[short]) return short
  }

  // 4. Fallback
  return DEFAULT_LANG
}

// ============ Translation Function ============
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[key]
  }
  return current
}

export function t(key: string, params?: Record<string, string | number>): string {
  const lang = currentLang || DEFAULT_LANG
  let value = getNestedValue(translations[lang], key)

  // Fallback to English
  if (value === undefined && lang !== DEFAULT_LANG) {
    value = getNestedValue(translations[DEFAULT_LANG], key)
  }

  // Fallback: show key
  if (value === undefined) return key

  if (typeof value !== 'string') return key

  // Interpolation: replace {{varName}} with param values
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, k) =>
      params[k] !== undefined ? String(params[k]) : `{{${k}}}`
    )
  }
  return value
}

// ============ SEO: Dynamic Meta Tags ============
// Map app language code → BCP-47 locale tag (used in og:locale and hreflang)
const BCP47: Record<string, string> = {
  en: 'en_US', zh: 'zh_CN', es: 'es_ES', fr: 'fr_FR', de: 'de_DE',
  ja: 'ja_JP', pt: 'pt_BR', ar: 'ar_SA', ko: 'ko_KR', ru: 'ru_RU',
  tr: 'tr_TR', vi: 'vi_VN', th: 'th_TH', hi: 'hi_IN', it: 'it_IT',
}
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://math-game.lazytoolshub.top'
const SEO_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Math Wizard — Fun Math Games for Kids Ages 6-12',
    description: 'Free online math games for children! RPG adventures, timed challenges, achievement system. Learn addition, subtraction, multiplication through play. No download needed.',
  },
  zh: {
    title: '算数小能手 — 儿童趣味数学游戏（6-12岁）',
    description: '免费在线儿童数学游戏！RPG冒险、计时挑战、成就系统。通过游戏学习加减乘除。无需下载，即开即玩。',
  },
  es: {
    title: 'Math Wizard — Juegos de Matemáticas Divertidos para Niños',
    description: '¡Juegos de matemáticas gratis en línea para niños! Aventuras RPG, desafíos cronometrados, sistema de logros. Aprende suma, resta, multiplicación jugando.',
  },
  fr: {
    title: 'Math Wizard — Jeux de Maths Ludiques pour Enfants',
    description: 'Jeux de maths gratuits en ligne pour enfants ! Aventures RPG, défis chronométrés, système de réussites. Apprends l\'addition, la soustraction, la multiplication en jouant.',
  },
  de: {
    title: 'Math Wizard — Lustige Mathe-Spiele für Kinder',
    description: 'Kostenlose Online-Mathe-Spiele für Kinder! RPG-Abenteuer, Zeit-Challenges, Erfolgssystem. Lerne Addition, Subtraktion, Multiplikation durch Spielen.',
  },
  ja: {
    title: 'Math Wizard — 子供向け楽しい算数ゲーム',
    description: '子供向けの無料オンライン算数ゲーム！RPGアドベンチャー、タイムチャレンジ、実績システム。遊びながら足し算・引き算・掛け算を学ぼう。',
  },
  pt: {
    title: 'Math Wizard — Jogos de Matemática Divertidos para Crianças',
    description: 'Jogos de matemática grátis online para crianças! Aventuras RPG, desafios cronometrados, sistema de conquistas. Aprenda adição, subtração, multiplicação jogando.',
  },
  ar: {
    title: 'Math Wizard — ألعاب رياضيات ممتعة للأطفال',
    description: 'ألعاب رياضيات مجانية عبر الإنترنت للأطفال! مغامرات RPG، تحديات زمنية، نظام إنجازات. تعلم الجمع والطرح والضرب من خلال اللعب.',
  },
  ko: { title: 'Math Wizard — 어린이를 위한 재미있는 수학 게임', description: '어린이를 위한 무료 온라인 수학 게임! RPG 모험, 시간 도전, 업적 시스템. 놀이를 통해 덧셈, 뺄셈, 곱셈을 배워요.' },
  ru: { title: 'Math Wizard — Весёлые математические игры для детей', description: 'Бесплатные онлайн математические игры для детей! RPG приключения, испытания на время, система достижений. Учите сложение, вычитание, умножение играя.' },
  tr: { title: 'Math Wizard — Çocuklar İçin Eğlenceli Matematik Oyunları', description: 'Çocuklar için ücretsiz online matematik oyunları! RPG maceraları, zamanlı challengelar, başarı sistemi. Oynayarak toplama, çıkarma, çarpma öğrenin.' },
  vi: { title: 'Math Wizard — Trò Chơi Toán Vui Nhộn Cho Bé', description: 'Trò chơi toán trực tuyến miễn phí cho trẻ em! Phiêu lưu RPG, thách thức thời gian, hệ thống thành tựu. Học cộng, trừ, nhân qua chơi.' },
  th: { title: 'Math Wizard — เกมส์คณิตศาสตร์สนุกสำหรับเด็ก', description: 'เกมส์คณิตศาสตร์ออนไลน์ฟรีสำหรับเด็ก! ผจญภัย RPG, ท้าทายเวลา, ระบบความสำเร็จ. เรียนรู้การบวก ลบ คูณ ผ่านการเล่น' },
  hi: { title: 'Math Wizard — बच्चों के लिए मज़ेदार गणित के खेल', description: 'बच्चों के लिए मुफ्त ऑनलाइन गणित के खेल! RPG रोमांच, टाइम चैलेंज, उपलब्धि सिस्टम। खेल-खेल में जोड़, घटाव, गुणा सीखें।' },
  it: { title: 'Math Wizard — Giochi di Matematica Divertenti per Bambini', description: 'Giochi di matematica gratis online per bambini! Avventure RPG, sfide a tempo, sistema di traguardi. Impara addizione, sottrazione, moltiplicazione giocando.' },
}

function setMeta(selector: string, attr: string, value: string, createIfMissing?: { tag: string; attrs: Record<string, string> }) {
  let el = document.head.querySelector(selector) as HTMLElement | null
  if (!el && createIfMissing) {
    el = document.createElement(createIfMissing.tag)
    Object.entries(createIfMissing.attrs).forEach(([k, v]) => el!.setAttribute(k, v))
    document.head.appendChild(el)
  }
  if (el) el.setAttribute(attr, value)
}

function updateSEO(lang: string) {
  const seo = SEO_META[lang] || SEO_META[DEFAULT_LANG]
  const path = window.location.pathname
  const canonicalUrl = `${SITE_URL}${path}${lang === DEFAULT_LANG ? '' : `?lang=${lang}`}`
  const ogLocale = BCP47[lang] || 'en_US'

  // <title>
  document.title = seo.title

  // Standard meta
  setMeta('meta[name="description"]', 'content', seo.description, { tag: 'meta', attrs: { name: 'description' } })

  // <html lang> and <html dir>
  document.documentElement.lang = lang
  const langDef = LANGUAGES.find((l) => l.code === lang)
  document.documentElement.dir = langDef?.dir || 'ltr'

  // Canonical URL
  setMeta('link[rel="canonical"]', 'href', canonicalUrl, { tag: 'link', attrs: { rel: 'canonical' } })

  // hreflang alternates: tell Google about every language version
  // Remove existing hreflang links (avoid stale entries on re-update)
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove())
  for (const l of LANGUAGES) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'alternate')
    link.setAttribute('hreflang', l.code)
    link.setAttribute('href', `${SITE_URL}${path}${l.code === DEFAULT_LANG ? '' : `?lang=${l.code}`}`)
    document.head.appendChild(link)
  }
  // x-default points to the canonical English version
  const xDefault = document.createElement('link')
  xDefault.setAttribute('rel', 'alternate')
  xDefault.setAttribute('hreflang', 'x-default')
  xDefault.setAttribute('href', `${SITE_URL}${path}`)
  document.head.appendChild(xDefault)

  // Open Graph
  setMeta('meta[property="og:title"]', 'content', seo.title, { tag: 'meta', attrs: { property: 'og:title' } })
  setMeta('meta[property="og:description"]', 'content', seo.description, { tag: 'meta', attrs: { property: 'og:description' } })
  setMeta('meta[property="og:type"]', 'content', 'website', { tag: 'meta', attrs: { property: 'og:type' } })
  setMeta('meta[property="og:url"]', 'content', canonicalUrl, { tag: 'meta', attrs: { property: 'og:url' } })
  setMeta('meta[property="og:site_name"]', 'content', 'Math Wizard', { tag: 'meta', attrs: { property: 'og:site_name' } })
  setMeta('meta[property="og:locale"]', 'content', ogLocale, { tag: 'meta', attrs: { property: 'og:locale' } })
  setMeta('meta[property="og:image"]', 'content', `${SITE_URL}/og-image.png`, { tag: 'meta', attrs: { property: 'og:image' } })
  // og:locale:alternate for each other language
  document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((el) => el.remove())
  for (const l of LANGUAGES) {
    if (l.code === lang) continue
    const m = document.createElement('meta')
    m.setAttribute('property', 'og:locale:alternate')
    m.setAttribute('content', BCP47[l.code] || 'en_US')
    document.head.appendChild(m)
  }

  // Twitter Card
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image', { tag: 'meta', attrs: { name: 'twitter:card' } })
  setMeta('meta[name="twitter:title"]', 'content', seo.title, { tag: 'meta', attrs: { name: 'twitter:title' } })
  setMeta('meta[name="twitter:description"]', 'content', seo.description, { tag: 'meta', attrs: { name: 'twitter:description' } })
  setMeta('meta[name="twitter:image"]', 'content', `${SITE_URL}/og-image.png`, { tag: 'meta', attrs: { name: 'twitter:image' } })

  // JSON-LD structured data: EducationalApplication / Game schema
  // Google uses this for Rich Snippets in search results
  let jsonLd = document.head.querySelector('#json-ld-app') as HTMLScriptElement | null
  if (!jsonLd) {
    jsonLd = document.createElement('script')
    jsonLd.id = 'json-ld-app'
    jsonLd.type = 'application/ld+json'
    document.head.appendChild(jsonLd)
  }
  jsonLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'EducationalApplication',
    name: seo.title,
    description: seo.description,
    url: canonicalUrl,
    inLanguage: lang,
    applicationCategory: 'EducationalApplication',
    educationalLevel: 'Primary education',
    audience: { '@type': 'EducationalAudience', educationalRole: 'student', audienceType: 'children ages 6-12' },
    typicalAgeRange: '6-12',
    operatingSystem: 'Any (web browser)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    learningResourceType: ['Game', 'Quiz', 'Interactive activity'],
    teaches: ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Word Problems', 'Fractions'],
  })
}

// ============ React Context & Provider ============
// Initialize currentLang at module load so the very first render uses the detected language
// (avoids 1-frame flash of English content for non-English users)
let currentLang: string = typeof window !== 'undefined' ? detectLanguage() : DEFAULT_LANG

interface I18nContextType {
  lang: string
  setLanguage: (code: string) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType>({
  lang: DEFAULT_LANG,
  setLanguage: () => {},
  t: () => '',
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState(() => currentLang)

  // Sync SEO meta on initial mount
  useEffect(() => {
    updateSEO(lang)
  }, [])

  const setLanguage = useCallback((code: string) => {
    if (!translations[code]) return
    currentLang = code
    setLang(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch {}
    // Update URL query param without page reload (clean URL for default language)
    try {
      const url = new URL(window.location.href)
      if (code === DEFAULT_LANG) url.searchParams.delete('lang')
      else url.searchParams.set('lang', code)
      window.history.replaceState({}, '', url.toString())
    } catch {}
    updateSEO(code)
  }, [])

  const tFn = useCallback(
    (key: string, params?: Record<string, string | number>) => t(key, params),
    // t() reads currentLang which is always up to date
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t: tFn }}>
      {children}
    </I18nContext.Provider>
  )
}

// ============ Hook ============
// Returns { t, lang, setLanguage } — drop-in compatible with react-i18next's useTranslation()
export function useTranslation() {
  const ctx = useContext(I18nContext)
  return { t: ctx.t, i18n: { language: ctx.lang, changeLanguage: ctx.setLanguage } }
}

// For non-React files (engine/questions.ts etc.)
export const i18n = { t }

export default { t, useTranslation, I18nProvider, LANGUAGES }
