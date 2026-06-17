/**
 * 题目引擎 - 按年级动态生成数学题
 * 覆盖 1-6 年级核心知识点
 */

import { i18n } from '@/i18n'

export interface Question {
  id: string
  grade: number
  type: 'add' | 'subtract' | 'multiply' | 'divide' | 'word'
  expression: string
  answer: number
  options: number[]
  hint: string
  knowledgePoint: string
}

const KNOWLEDGE_POINTS: Record<number, string[]> = {
  1: [
    i18n.t('engine.knowledge.add10'),
    i18n.t('engine.knowledge.sub10'),
    i18n.t('engine.knowledge.add20'),
    i18n.t('engine.knowledge.sub20'),
  ],
  2: [
    i18n.t('engine.knowledge.add100'),
    i18n.t('engine.knowledge.sub100'),
    i18n.t('engine.knowledge.mul'),
  ],
  3: [
    i18n.t('engine.knowledge.add10000'),
    i18n.t('engine.knowledge.multiDigitMul1'),
    i18n.t('engine.knowledge.fracIntro'),
  ],
  4: [
    i18n.t('engine.knowledge.multiDigitMulDiv'),
    i18n.t('engine.knowledge.decimalOps'),
    i18n.t('engine.knowledge.simpleEq'),
  ],
  5: [
    i18n.t('engine.knowledge.fracFourOps'),
    i18n.t('engine.knowledge.decimalMulDiv'),
    i18n.t('engine.knowledge.basicStats'),
  ],
  6: [
    i18n.t('engine.knowledge.fracDecPct'),
    i18n.t('engine.knowledge.ratio'),
    i18n.t('engine.knowledge.circleArea'),
  ],
}

const WORD_TEMPLATES = [
  {
    template: (a: number, b: number, name: string, item: string) =>
      i18n.t('engine.templates.buyMore', { name, a, item, b }),
    answer: (a: number, b: number) => a + b,
    type: 'add' as const,
  },
  {
    template: (a: number, b: number, name: string, item: string) =>
      i18n.t('engine.templates.giveAway', { name, a, item, b }),
    answer: (a: number, b: number) => a - b,
    type: 'subtract' as const,
  },
  {
    template: (total: number, people: number, name: string, item: string) =>
      i18n.t('engine.templates.share', { name, total, item, people }),
    answer: (total: number, people: number) => total / people,
    type: 'divide' as const,
  },
]

const NAMES = [
  i18n.t('engine.names.0'),
  i18n.t('engine.names.1'),
  i18n.t('engine.names.2'),
  i18n.t('engine.names.3'),
  i18n.t('engine.names.4'),
]
const ITEMS = [
  i18n.t('engine.items.0'),
  i18n.t('engine.items.1'),
  i18n.t('engine.items.2'),
  i18n.t('engine.items.3'),
  i18n.t('engine.items.4'),
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function generateOptions(answer: number, count = 4): number[] {
  const options = new Set<number>([answer])
  let attempts = 0
  while (options.size < count && attempts < 50) {
    const offset = randomInt(-10, 10)
    const wrong = answer + offset
    if (wrong >= 0 && wrong !== answer) options.add(wrong)
    attempts++
  }
  while (options.size < count) options.add(answer + options.size * 3)
  return shuffle([...options])
}

function getGradeRange(grade: number): [number, number] {
  switch (grade) {
    case 1:
      return [1, 10]
    case 2:
      return [1, 20]
    case 3:
      return [10, 100]
    case 4:
      return [10, 1000]
    default:
      return [10, 100]
  }
}

export function generateQuestion(grade: number = 1): Question {
  const [min, max] = getGradeRange(grade)
  const types =
    grade <= 2
      ? ['add', 'subtract']
      : grade <= 4
        ? ['add', 'subtract', 'multiply']
        : ['add', 'subtract', 'multiply', 'divide', 'word']
  const type = types[randomInt(0, types.length - 1)] as Question['type']

  let expression = ''
  let answer = 0
  let hint = ''

  const kpList = KNOWLEDGE_POINTS[Math.min(grade, 6)] || KNOWLEDGE_POINTS[1]
  const knowledgePoint = kpList[randomInt(0, kpList.length - 1)]

  switch (type) {
    case 'add': {
      const a = randomInt(min, max)
      const b = randomInt(min, max)
      expression = `${a} + ${b} = ?`
      answer = a + b
      hint = i18n.t('engine.hint.addition')
      break
    }
    case 'subtract': {
      const a = randomInt(min, max)
      const b = randomInt(min, a)
      expression = `${a} - ${b} = ?`
      answer = a - b
      hint = i18n.t('engine.hint.subtraction')
      break
    }
    case 'multiply': {
      const mulMax = grade <= 3 ? 9 : 12
      const a = randomInt(2, mulMax)
      const b = randomInt(2, mulMax)
      expression = `${a} × ${b} = ?`
      answer = a * b
      hint = i18n.t('engine.hint.multiplication')
      break
    }
    case 'divide': {
      const b = randomInt(2, 9)
      const answerVal = randomInt(2, 9)
      const a = b * answerVal
      expression = `${a}  ${b} = ?`
      answer = answerVal
      hint = i18n.t('engine.hint.division')
      break
    }
    case 'word': {
      const tmpl = WORD_TEMPLATES[randomInt(0, WORD_TEMPLATES.length - 1)]
      const name = NAMES[randomInt(0, NAMES.length - 1)]
      const item = ITEMS[randomInt(0, ITEMS.length - 1)]
      const a = randomInt(3, 15)
      const b = randomInt(2, 10)
      expression = tmpl.template(a, b, name, item)
      answer = tmpl.answer(a, b)
      hint = i18n.t('engine.hint.wordProblem')
      break
    }
  }

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    grade,
    type,
    expression,
    answer,
    options: generateOptions(answer),
    hint,
    knowledgePoint,
  }
}

// Word problem templates
const WORD_PROBLEM_TEMPLATES = [
  {
    template: (a: number, b: number) =>
      i18n.t('engine.templates.buyMore', {
        name: i18n.t('engine.names.0'),
        a,
        item: i18n.t('engine.items.0'),
        b,
      }),
    answer: (a: number, b: number) => a + b,
    type: 'word' as const,
  },
  {
    template: (a: number, b: number) =>
      i18n.t('engine.templates.giveAway', {
        name: i18n.t('engine.names.0'),
        a,
        item: i18n.t('engine.items.0'),
        b,
      }),
    answer: (a: number, b: number) => a - b,
    type: 'word' as const,
  },
  {
    template: (total: number, people: number) =>
      i18n.t('engine.templates.share', {
        name: i18n.t('engine.names.0'),
        total,
        item: i18n.t('engine.items.0'),
        people,
      }),
    answer: (total: number, people: number) => total / people,
    type: 'word' as const,
  },
]

export function generateWordProblem(grade: number): Question {
  const tmpl = WORD_PROBLEM_TEMPLATES[Math.floor(Math.random() * WORD_PROBLEM_TEMPLATES.length)]
  const maxNum = grade <= 2 ? 20 : grade <= 4 ? 100 : 1000
  const a = Math.floor(Math.random() * maxNum) + 1
  const b = Math.floor(Math.random() * maxNum) + 1
  const expr = tmpl.template(a, b)
  const answer = tmpl.answer(a, b)
  const options = new Set([answer])
  while (options.size < 4) {
    const w = answer + Math.floor(Math.random() * 20) - 10
    if (w >= 0 && w !== answer) options.add(w)
  }
  return {
    id: `word_${Date.now()}_${Math.random()}`,
    grade,
    type: 'word',
    expression: expr,
    answer,
    options: [...options].sort(() => Math.random() - 0.5),
    hint: i18n.t('engine.hint.wordProblem'),
    knowledgePoint: i18n.t('engine.knowledge.wordProblem'),
  }
}

export function generateQuestions(grade: number, count: number = 10): Question[] {
  return Array.from({ length: count }, () => generateQuestion(grade))
}
