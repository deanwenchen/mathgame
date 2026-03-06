import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface GameState {
  score: number
  level: number
  lives: number
  currentQuestion: number
  correctAnswers: number
  isPlaying: boolean
}

const initialState: GameState = {
  score: 0,
  level: 1,
  lives: 3,
  currentQuestion: 0,
  correctAnswers: 0,
  isPlaying: false,
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.isPlaying = true
      state.score = 0
      state.lives = 3
      state.currentQuestion = 0
      state.correctAnswers = 0
    },
    endGame: (state) => {
      state.isPlaying = false
    },
    addScore: (state, action: PayloadAction<number>) => {
      state.score += action.payload
    },
    loseLife: (state) => {
      state.lives = Math.max(0, state.lives - 1)
    },
    nextQuestion: (state) => {
      state.currentQuestion += 1
    },
    answerCorrect: (state) => {
      state.correctAnswers += 1
    },
    levelUp: (state) => {
      state.level += 1
    },
    resetGame: () => initialState,
  },
})

export const {
  startGame,
  endGame,
  addScore,
  loseLife,
  nextQuestion,
  answerCorrect,
  levelUp,
  resetGame,
} = gameSlice.actions

export default gameSlice.reducer