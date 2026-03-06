// Type Definitions
// TypeScript interfaces and types for the application

export interface User {
  id: string
  name: string
  age: number
  avatar: string
  level: number
  experience: number
  coins: number
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: string
  type: 'addition' | 'subtraction' | 'multiplication' | 'division'
  difficulty: number
  expression: string
  answer: number
  options?: number[]
  timeLimit?: number
  points: number
}

export interface GameSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  score: number
  correctAnswers: number
  totalQuestions: number
  questions: Question[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  type: 'score' | 'streak' | 'level' | 'speed'
}

export interface Equipment {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'accessory'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  stats: {
    attack?: number
    defense?: number
    speed?: number
    luck?: number
  }
}

export interface Character {
  id: string
  name: string
  level: number
  experience: number
  health: number
  maxHealth: number
  attack: number
  defense: number
  equipment: Equipment[]
}