import { useState, useCallback, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getQuizStats, finishQuizGame, type QuizStats } from '@utils/storage'
import { generateQuestion } from '@engine/questions'

interface Monster { name: string; emoji: string; hp: number; maxHp: number; attack: number; reward: { xp: number; coins: number } }
interface Character { level: number; xp: number; xpToNext: number; hp: number; maxHp: number; coins: number; totalXp: number }
type Phase = 'select' | 'battle' | 'result'

const MONSTERS = [
  { name: '史莱姆', emoji: '' }, { name: '哥布林', emoji: '' }, { name: '骷髅兵', emoji: '' },
  { name: '暗影狼', emoji: '' }, { name: '石像鬼', emoji: '' }, { name: '火焰精灵', emoji: '' },
  { name: '冰霜巨人', emoji: '' }, { name: '毒龙', emoji: '' },
]

function createMonster(stage: number): Monster {
  const t = MONSTERS[Math.min(stage - 1, MONSTERS.length - 1)]
  const hp = 30 + stage * 15
  return { name: t.name, emoji: t.emoji, hp, maxHp: hp, attack: 5 + stage * 3, reward: { xp: 15 + stage * 5, coins: 5 + stage * 2 } }
}

const XP_PER_LEVEL = 50
const SPRING = { type: 'spring' as const, stiffness: 300, damping: 20 }

function Game() {
  const [phase, setPhase] = useState<Phase>('select')
  const [grade, setGrade] = useState(1)
  const [stage, setStage] = useState(1)
  const [stats, setStats] = useState<QuizStats>(() => getQuizStats())
  const [character, setCharacter] = useState<Character>({ level: 1, xp: 0, xpToNext: XP_PER_LEVEL, hp: 100, maxHp: 100, coins: 0, totalXp: 0 })
  const [monster, setMonster] = useState<Monster | null>(null)
  const [question, setQuestion] = useState(generateQuestion(1))
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [combo, setCombo] = useState(0)
  const [dmgNums, setDmgNums] = useState<{ id: number; value: number; target: 'monster' | 'player' }[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [showHint, setShowHint] = useState(false)
  const [result, setResult] = useState<{ won: boolean; xp: number; coins: number } | null>(null)
  const idRef = useRef(0)

  const addDmg = useCallback((value: number, target: 'monster' | 'player') => {
    const id = ++idRef.current
    setDmgNums(p => [...p, { id, value, target }])
    setTimeout(() => setDmgNums(p => p.filter(d => d.id !== id)), 1200)
  }, [])

  const addLog = useCallback((msg: string) => setLogs(p => [msg, ...p].slice(0, 5)), [])

  const startBattle = useCallback((g: number) => {
    setGrade(g); setStage(1); setCombo(0); setLogs([]); setShowHint(false)
    setCharacter(p => ({ ...p, hp: p.maxHp }))
    const m = createMonster(1)
    setMonster(m); setQuestion(generateQuestion(g)); setSelectedAnswer(null); setIsCorrect(null)
    setPhase('battle'); addLog(`${m.emoji} ${m.name} 出现了！`)
  }, [addLog])

  const nextStage = useCallback(() => {
    const ns = stage + 1; setStage(ns)
    const m = createMonster(ns); setMonster(m)
    setQuestion(generateQuestion(grade)); setSelectedAnswer(null); setIsCorrect(null)
    setShowHint(false); setCombo(0); addLog(`第${ns}关！${m.emoji} ${m.name} 出现了！`)
  }, [stage, grade, addLog])

  const handleAnswer = useCallback((answer: number) => {
    if (selectedAnswer !== null || !monster) return
    setSelectedAnswer(answer)
    const correct = answer === question.answer
    setIsCorrect(correct)
    const newCombo = correct ? combo + 1 : 0
    setCombo(newCombo)

    if (correct) {
      const mult = 1 + Math.floor(newCombo / 3) * 0.25
      const dmg = Math.floor((8 + grade * 2) * mult)
      const newHp = Math.max(0, monster.hp - dmg)
      addDmg(dmg, 'monster')
      addLog(`正确！造成 ${dmg} 伤害${mult > 1 ? ` (${newCombo}连击!)` : ''}`)
      setMonster(p => p ? { ...p, hp: newHp } : null)

      if (newHp <= 0) {
        addLog(`${monster.emoji} ${monster.name} 被击败！+${monster.reward.xp}XP +${monster.reward.coins}金币`)
        addDmg(monster.reward.xp, 'monster')
        setTimeout(() => {
          setCharacter(prev => {
            let xp = prev.xp + monster.reward.xp, lv = prev.level, nxt = prev.xpToNext, maxHp = prev.maxHp, hp = prev.hp, total = prev.totalXp + monster.reward.xp
            while (xp >= nxt) { xp -= nxt; lv++; nxt = Math.floor(XP_PER_LEVEL * Math.pow(1.3, lv - 1)); maxHp += 10; hp = maxHp; addLog(`升级！Lv.${lv}！HP=${maxHp}`) }
            return { ...prev, xp, level: lv, xpToNext: nxt, maxHp, hp, coins: prev.coins + monster.reward.coins, totalXp: total }
          })
          setResult({ won: true, xp: monster.reward.xp, coins: monster.reward.coins })
          setPhase('result')
        }, 1500)
      }
    } else {
      addDmg(monster.attack, 'player')
      addLog(`错误！被攻击，-${monster.attack} HP`)
      const newCharHp = Math.max(0, character.hp - monster.attack)
      setCharacter(p => ({ ...p, hp: newCharHp }))
      if (newCharHp <= 0) { setTimeout(() => { setResult({ won: false, xp: 0, coins: 0 }); setPhase('result') }, 1500) }
    }

    setTimeout(() => { setQuestion(generateQuestion(grade)); setSelectedAnswer(null); setIsCorrect(null); setShowHint(false) }, 1500)
  }, [selectedAnswer, monster, question, combo, grade, addDmg, addLog, character.hp])

  useEffect(() => {
    if (phase === 'result' && result) {
      const updated = finishQuizGame({ score: result.xp * 10, level: character.level, questions: 1, correct: result.won ? 1 : 0 })
      setStats(updated)
    }
  }, [phase, result, character.level])

  // ===== 年级选择 =====
  if (phase === 'select') return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">数学大冒险</h1>
          <p className="text-purple-300">选择年级，开始你的冒险之旅！</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-purple-300 font-bold">Lv.{character.level}</span>
            <span className="text-amber-400 font-bold">{character.coins} 金币</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-1"><span>HP</span><span>{character.hp}/{character.maxHp}</span></div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(character.hp / character.maxHp) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-1"><span>EXP</span><span>{character.xp}/{character.xpToNext}</span></div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${(character.xp / character.xpToNext) * 100}%` }} />
          </div>
        </motion.div>
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(g => (
            <motion.button key={g} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startBattle(g)}
              className="py-4 bg-gradient-to-br from-purple-500/80 to-indigo-600/80 backdrop-blur-sm rounded-2xl border border-white/20 text-white font-bold text-lg shadow-lg active:scale-[0.98]">
              {g}年级
            </motion.button>
          ))}
        </div>
        <Link to="/" className="text-purple-400 hover:text-purple-300 text-sm transition-colors"> 返回首页</Link>
      </div>
    </div>
  )

  // ===== 战斗 =====
  if (phase === 'battle' && monster) return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 flex flex-col relative overflow-hidden">
      <header className="bg-black/30 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-purple-400 font-bold text-sm">Lv.{character.level}</span>
          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${(character.hp / character.maxHp) * 100}%` }} />
          </div>
        </div>
        <span className="text-amber-400 text-sm font-bold">第{stage}关</span>
        <div className="flex items-center gap-2">
          {combo >= 3 && <span className="text-orange-400 text-xs font-bold animate-pulse">{combo}连击!</span>}
          <span className="text-amber-400 text-sm">{character.coins}</span>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <motion.div key={monster.hp} className="relative mb-8 text-center">
          <motion.div className="text-8xl md:text-9xl select-none"
            animate={monster.hp <= 0 ? { opacity: 0, scale: 0.5, rotate: 180 } : monster.hp < monster.maxHp * 0.3 ? { scale: [1, 1.05, 1] } : {}}>
            {monster.emoji}
          </motion.div>
          <div className="mt-2">
            <span className="text-white font-bold text-lg">{monster.name}</span>
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto mt-1">
              <motion.div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" animate={{ width: `${(monster.hp / monster.maxHp) * 100}%` }} transition={SPRING} />
            </div>
            <span className="text-xs text-gray-400">{monster.hp}/{monster.maxHp}</span>
          </div>
          <AnimatePresence>
            {dmgNums.filter(d => d.target === 'monster').map(d => (
              <motion.div key={d.id} initial={{ opacity: 1, y: 0, scale: 1.5 }} animate={{ opacity: 0, y: -60, scale: 1 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl font-black text-red-400 pointer-events-none">-{d.value}</motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <motion.div key={question.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
          className="max-w-lg w-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-4">
          <div className="text-center mb-4">
            <span className="text-xs text-purple-400 uppercase tracking-wider">{question.knowledgePoint}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">{question.expression}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {question.options.map(option => {
              let cls = 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
              if (selectedAnswer !== null) {
                if (option === question.answer) cls = 'bg-green-500 border-green-400 text-white'
                else if (option === selectedAnswer) cls = 'bg-red-500 border-red-400 text-white'
                else cls = 'bg-white/5 border-white/10 text-gray-500'
              }
              return (
                <motion.button key={option} whileHover={selectedAnswer === null ? { scale: 1.03 } : {}} whileTap={selectedAnswer === null ? { scale: 0.97 } : {}}
                  onClick={() => handleAnswer(option)} disabled={selectedAnswer !== null}
                  className={`py-3 px-4 text-xl font-bold rounded-xl border transition-all ${cls}`}>{option}</motion.button>
              )
            })}
          </div>
          <AnimatePresence>
            {selectedAnswer !== null && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className={`mt-4 text-center py-2 rounded-xl ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <p className="font-bold">{isCorrect ? ' 正确！' : ` 错误！答案是 ${question.answer}`}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCorrect && selectedAnswer === null && (
            <button onClick={() => setShowHint(!showHint)} className="mt-2 text-xs text-purple-400 hover:text-purple-300">
              {showHint ? `提示：${question.hint}` : '需要提示？'}
            </button>
          )}
        </motion.div>
        <div className="max-w-lg w-full space-y-1">
          {logs.map((log, i) => (
            <motion.div key={`${log}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: Math.max(0, 1 - i * 0.2), x: 0 }}
              className="text-xs text-gray-400 truncate">{log}</motion.div>
          ))}
        </div>
        <AnimatePresence>
          {dmgNums.filter(d => d.target === 'player').map(d => (
            <motion.div key={d.id} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: 40 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 text-2xl font-black text-red-500 pointer-events-none">-{d.value} HP</motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )

  // ===== 结算 =====
  if (phase === 'result' && result) return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}
        className="max-w-sm w-full bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 text-center space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}>
          <div className="text-6xl mb-4">{result.won ? '' : '💔'}</div>
          <h2 className="text-3xl font-bold text-white">{result.won ? '胜利！' : '失败'}</h2>
          <p className="text-purple-300 mt-2">{result.won ? `${monster?.name} 被击败了！` : '下次继续加油！'}</p>
        </motion.div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500/20 rounded-xl p-3">
            <div className="text-2xl font-bold text-blue-400">+{result.xp}</div>
            <div className="text-xs text-gray-400">经验值</div>
          </div>
          <div className="bg-amber-500/20 rounded-xl p-3">
            <div className="text-2xl font-bold text-amber-400">+{result.coins}</div>
            <div className="text-xs text-gray-400">金币</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 space-y-2 text-left text-sm">
          <div className="flex justify-between"><span className="text-gray-400">等级</span><span className="text-white font-bold">Lv.{character.level}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">总经验</span><span className="text-white font-bold">{character.totalXp} XP</span></div>
          <div className="flex justify-between"><span className="text-gray-400">金币</span><span className="text-amber-400 font-bold">{character.coins}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">历史最高</span><span className="text-purple-400 font-bold">{stats.highScore}</span></div>
        </div>
        <div className="space-y-3">
          {result.won && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStage}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-full shadow-lg active:scale-[0.98]">继续冒险 →</motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setPhase('select')}
            className="w-full py-3 bg-white/10 text-white font-medium rounded-full border border-white/20 hover:bg-white/20 active:scale-[0.98]">选择年级</motion.button>
          <Link to="/quiz" className="block text-purple-400 text-sm hover:text-purple-300">去答题练习 →</Link>
        </div>
      </motion.div>
    </div>
  )

  return null
}

export default Game
