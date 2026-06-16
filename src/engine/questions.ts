/**
 * 题目引擎 - 按年级动态生成数学题
 * 覆盖 1-6 年级核心知识点
 */

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
  1: ['10以内加法', '10以内减法', '20以内加法', '20以内减法'],
  2: ['100以内加法', '100以内减法', '表内乘法'],
  3: ['万以内加减法', '多位数乘一位数', '分数初步'],
  4: ['多位数乘除法', '小数运算', '简易方程'],
  5: ['分数四则运算', '小数乘除法', '简单统计'],
  6: ['分数小数百分数', '比和比例', '圆的周长面积'],
}

const WORD_TEMPLATES = [
  { template: (a: number, b: number, name: string, item: string) => `${name}有${a}个${item}，又买了${b}个，一共有几个？`, answer: (a: number, b: number) => a + b, type: 'add' as const },
  { template: (a: number, b: number, name: string, item: string) => `${name}有${a}个${item}，送给朋友${b}个，还剩几个？`, answer: (a: number, b: number) => a - b, type: 'subtract' as const },
  { template: (a: number, b: number, name: string, item: string) => `每盒${item}有${a}个，${name}买了${b}盒，一共有几个？`, answer: (a: number, b: number) => a * b, type: 'multiply' as const },
]

const NAMES = ['小明', '小红', '小华', '小丽', '小刚']
const ITEMS = ['苹果', '铅笔', '橡皮', '糖果', '气球']

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
    case 1: return [1, 10]
    case 2: return [1, 20]
    case 3: return [10, 100]
    case 4: return [10, 1000]
    default: return [10, 100]
  }
}

export function generateQuestion(grade: number = 1): Question {
  const [min, max] = getGradeRange(grade)
  const types = grade <= 2 ? ['add', 'subtract'] : grade <= 4 ? ['add', 'subtract', 'multiply'] : ['add', 'subtract', 'multiply', 'divide', 'word']
  const type = types[randomInt(0, types.length - 1)] as Question['type']

  let expression = ''
  let answer = 0
  let hint = ''

  const kpList = KNOWLEDGE_POINTS[Math.min(grade, 6)] || KNOWLEDGE_POINTS[1]
  const knowledgePoint = kpList[randomInt(0, kpList.length - 1)]

  switch (type) {
    case 'add': {
      const a = randomInt(min, max); const b = randomInt(min, max)
      expression = `${a} + ${b} = ?`; answer = a + b
      hint = `从${a}往后数${b}个数`
      break
    }
    case 'subtract': {
      const a = randomInt(min, max); const b = randomInt(min, a)
      expression = `${a} - ${b} = ?`; answer = a - b
      hint = `从${a}往前数${b}个数`
      break
    }
    case 'multiply': {
      const mulMax = grade <= 3 ? 9 : 12
      const a = randomInt(2, mulMax); const b = randomInt(2, mulMax)
      expression = `${a} × ${b} = ?`; answer = a * b
      hint = `${a}个${b}相加`
      break
    }
    case 'divide': {
      const b = randomInt(2, 9); const answerVal = randomInt(2, 9)
      const a = b * answerVal
      expression = `${a}  ${b} = ?`; answer = answerVal
      hint = `${a}平均分成${b}份`
      break
    }
    case 'word': {
      const tmpl = WORD_TEMPLATES[randomInt(0, WORD_TEMPLATES.length - 1)]
      const name = NAMES[randomInt(0, NAMES.length - 1)]
      const item = ITEMS[randomInt(0, ITEMS.length - 1)]
      const a = randomInt(3, 15); const b = randomInt(2, 10)
      expression = tmpl.template(a, b, name, item)
      answer = tmpl.answer(a, b)
      hint = '求一共用加法，求还剩用减法'
      break
    }
  }

  return { id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, grade, type, expression, answer, options: generateOptions(answer), hint, knowledgePoint }
}

export function generateQuestions(grade: number, count: number = 10): Question[] {
  return Array.from({ length: count }, () => generateQuestion(grade))
}
