import { useState } from 'react'
import { Link } from 'react-router-dom'

interface Question {
  id: number
  expression: string
  answer: number
  options: number[]
}

function generateQuestion(level: number): Question {
  const maxNum = level * 10
  const num1 = Math.floor(Math.random() * maxNum) + 1
  const num2 = Math.floor(Math.random() * maxNum) + 1
  const operators = ['+', '-', '*']
  const operator = operators[Math.floor(Math.random() * Math.min(level, 3))]

  let expression: string
  let answer: number

  switch (operator) {
    case '+':
      expression = `${num1} + ${num2} = ?`
      answer = num1 + num2
      break
    case '-':
      expression = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`
      answer = Math.abs(num1 - num2)
      break
    case '*':
      const smallNum1 = Math.min(num1, 10)
      const smallNum2 = Math.min(num2, 10)
      expression = `${smallNum1} × ${smallNum2} = ?`
      answer = smallNum1 * smallNum2
      break
    default:
      expression = `${num1} + ${num2} = ?`
      answer = num1 + num2
  }

  // Generate wrong options
  const options: number[] = [answer]
  while (options.length < 4) {
    const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10
    if (wrongAnswer >= 0 && wrongAnswer !== answer && !options.includes(wrongAnswer)) {
      options.push(wrongAnswer)
    }
  }

  return {
    id: Date.now(),
    expression,
    answer,
    options: options.sort(() => Math.random() - 0.5),
  }
}

function Quiz() {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => generateQuestion(1))
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.answer
    setIsCorrect(correct)

    if (correct) {
      setScore((prev) => prev + level * 10)
      setCorrectCount((prev) => prev + 1)
    }

    // Auto advance after 1.5 seconds
    setTimeout(() => {
      const newQuestionCount = questionCount + 1
      setQuestionCount(newQuestionCount)

      // Level up every 5 correct answers
      if (correctCount > 0 && correctCount % 5 === 0) {
        setLevel((prev) => Math.min(prev + 1, 10))
      }

      setCurrentQuestion(generateQuestion(level))
      setSelectedAnswer(null)
      setIsCorrect(null)
    }, 1500)
  }

  const handleRestart = () => {
    setLevel(1)
    setScore(0)
    setQuestionCount(0)
    setCorrectCount(0)
    setCurrentQuestion(generateQuestion(1))
    setSelectedAnswer(null)
    setIsCorrect(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-primary-600 font-bold text-xl hover:text-primary-700">
            儿童算数小能手
          </Link>
          <div className="flex items-center space-x-4">
            <div className="bg-secondary-100 px-4 py-2 rounded-lg">
              <span className="text-secondary-700 font-bold">等级 {level}</span>
            </div>
            <div className="bg-primary-100 px-4 py-2 rounded-lg">
              <span className="text-primary-700 font-bold">得分: {score}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quiz Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="card max-w-lg w-full">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>已答题: {questionCount}</span>
              <span>正确: {correctCount}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-success-500 transition-all duration-300"
                style={{ width: `${questionCount > 0 ? (correctCount / questionCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display text-gray-800 mb-2">
              {currentQuestion.expression}
            </h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                className={`
                  py-4 px-6 text-2xl font-bold rounded-xl transition-all duration-200
                  ${selectedAnswer === null
                    ? 'bg-primary-100 hover:bg-primary-200 text-primary-700 hover:scale-105'
                    : option === currentQuestion.answer
                      ? 'bg-success-500 text-white scale-105'
                      : selectedAnswer === option
                        ? 'bg-danger-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {selectedAnswer !== null && (
            <div
              className={`text-center py-4 rounded-xl ${
                isCorrect ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
              }`}
            >
              <p className="text-lg font-bold">
                {isCorrect ? '回答正确!' : '再接再厉!'}
              </p>
            </div>
          )}

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="w-full mt-4 py-3 text-gray-500 hover:text-primary-600 transition-colors"
          >
            重新开始
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t px-4 py-3">
        <div className="max-w-2xl mx-auto text-center text-sm text-gray-400">
          答对题目获得积分，每答对 5 题自动升级
        </div>
      </footer>
    </div>
  )
}

export default Quiz