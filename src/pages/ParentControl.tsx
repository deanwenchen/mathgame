import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { getParentControl, setParentControl } from '@utils/storage'

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 }

function ParentControl() {
  const { t } = useTranslation()
  const [control, setControl] = useState(getParentControl())
  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(!control.enabled)

  const handleAuth = () => {
    if (pin === control.pin || !control.pin) setAuthenticated(true)
  }

  const handleSave = () => {
    setParentControl(control)
    alert(t('parent.saved'))
  }

  if (!authenticated) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="max-w-md w-full bg-white/80 rounded-3xl border shadow-xl p-8 text-center space-y-6"
        >
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800">{t('parent.title')}</h1>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={t('parent.enterPin')}
            className="w-full px-4 py-3 border border-gray-200 rounded-full text-center text-lg tracking-widest"
          />
          <button
            onClick={handleAuth}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-full"
          >
            {t('parent.confirm')}
          </button>
          <Link to="/" className="block text-gray-400 hover:text-purple-500">
            {t('parent.back')}
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{t('parent.title')}</h1>
          <Link
            to="/"
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-full"
          >
            {t('parent.back')}
          </Link>
        </div>
        <div className="space-y-4">
          <div className="bg-white/80 rounded-2xl border p-5 space-y-4">
            <label className="flex items-center justify-between">
              <span className="font-bold text-gray-700">{t('parent.enable')}</span>
              <input
                type="checkbox"
                checked={control.enabled}
                onChange={(e) => setControl({ ...control, enabled: e.target.checked })}
                className="w-5 h-5 accent-purple-500"
              />
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('parent.dailyLimit')} ({t('parent.minutes')})
              </label>
              <input
                type="number"
                value={control.dailyLimitMinutes}
                onChange={(e) =>
                  setControl({ ...control, dailyLimitMinutes: parseInt(e.target.value) || 60 })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-full"
                min="10"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('parent.setPin')}</label>
              <input
                type="password"
                value={control.pin}
                onChange={(e) => setControl({ ...control, pin: e.target.value })}
                placeholder={t('parent.pinPlaceholder')}
                maxLength={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-full text-center tracking-widest"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-full text-lg shadow-lg"
          >
            {t('parent.saveSettings')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ParentControl
