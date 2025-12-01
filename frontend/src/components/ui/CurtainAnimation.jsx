import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useUIStore from '../../store/uiStore'

export default function CurtainAnimation() {
  const { showCurtain, hideCurtain, setCurtainAnimationComplete } = useUIStore()
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Check if animation was already shown in this session
    const hasSeenAnimation = sessionStorage.getItem('curtainAnimationShown')
    
    if (hasSeenAnimation) {
      hideCurtain()
      setCurtainAnimationComplete()
      setIsAnimating(false)
      return
    }

    // Start animation after a brief delay
    const timer = setTimeout(() => {
      setIsAnimating(false)
      sessionStorage.setItem('curtainAnimationShown', 'true')
    }, 3000)

    return () => clearTimeout(timer)
  }, [hideCurtain, setCurtainAnimationComplete])

  const handleAnimationComplete = () => {
    hideCurtain()
    setCurtainAnimationComplete()
  }

  if (!showCurtain) return null

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isAnimating && (
        <div className="fixed inset-0 z-[100] overflow-hidden bg-charcoal-900">
          {/* Theater stage background */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-800 via-charcoal-900 to-black" />
          
          {/* Spotlight effect */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-full bg-gradient-radial from-amber-500/10 via-transparent to-transparent" />
          </div>

          {/* Left curtain panel */}
          <motion.div
            className="absolute top-0 left-0 w-1/2 h-full origin-left"
            initial={{ x: 0, scaleX: 1 }}
            animate={{ x: '-100%', scaleX: 0.8 }}
            exit={{ x: '-100%' }}
            transition={{
              duration: 1.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 1.2,
            }}
          >
            {/* Velvet curtain texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700">
              {/* Vertical folds */}
              <div className="absolute inset-0 flex">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 relative"
                    style={{
                      background: `linear-gradient(90deg, 
                        rgba(0,0,0,${0.1 + (i % 2) * 0.15}) 0%, 
                        transparent 30%,
                        transparent 70%,
                        rgba(0,0,0,${0.1 + ((i + 1) % 2) * 0.15}) 100%)`,
                    }}
                  />
                ))}
              </div>
              {/* Horizontal light gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-400/30 via-transparent to-amber-900/50" />
              {/* Silk shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            </div>
            {/* Inner shadow */}
            <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-black/40 to-transparent" />
            {/* Curtain ties */}
            <motion.div 
              className="absolute top-[20%] right-4 w-8 h-32 bg-gradient-to-b from-amber-800 via-amber-600 to-amber-800 rounded-full opacity-0"
              animate={{ opacity: [0, 1, 1] }}
              transition={{ duration: 0.5, delay: 1.5 }}
            />
          </motion.div>

          {/* Right curtain panel */}
          <motion.div
            className="absolute top-0 right-0 w-1/2 h-full origin-right"
            initial={{ x: 0, scaleX: 1 }}
            animate={{ x: '100%', scaleX: 0.8 }}
            exit={{ x: '100%' }}
            transition={{
              duration: 1.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 1.2,
            }}
          >
            {/* Velvet curtain texture */}
            <div className="absolute inset-0 bg-gradient-to-bl from-amber-600 via-amber-500 to-amber-700">
              {/* Vertical folds */}
              <div className="absolute inset-0 flex">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 relative"
                    style={{
                      background: `linear-gradient(90deg, 
                        rgba(0,0,0,${0.1 + ((i + 1) % 2) * 0.15}) 0%, 
                        transparent 30%,
                        transparent 70%,
                        rgba(0,0,0,${0.1 + (i % 2) * 0.15}) 100%)`,
                    }}
                  />
                ))}
              </div>
              {/* Horizontal light gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-400/30 via-transparent to-amber-900/50" />
              {/* Silk shine */}
              <div className="absolute inset-0 bg-gradient-to-bl from-white/10 via-transparent to-transparent" />
            </div>
            {/* Inner shadow */}
            <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-black/40 to-transparent" />
            {/* Curtain ties */}
            <motion.div 
              className="absolute top-[20%] left-4 w-8 h-32 bg-gradient-to-b from-amber-800 via-amber-600 to-amber-800 rounded-full opacity-0"
              animate={{ opacity: [0, 1, 1] }}
              transition={{ duration: 0.5, delay: 1.5 }}
            />
          </motion.div>

          {/* Top valance/pelmet */}
          <div className="absolute top-0 left-0 right-0 h-24 z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-700 via-amber-600 to-amber-800" />
            {/* Decorative trim */}
            <div className="absolute bottom-0 left-0 right-0 h-6 flex">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{
                    background: 'linear-gradient(180deg, #B45309 0%, #D97706 50%, #92400E 100%)',
                    borderRadius: '0 0 50% 50%',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  }}
                />
              ))}
            </div>
            {/* Gold trim line */}
            <div className="absolute bottom-6 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300" />
          </div>

          {/* Center logo/text */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white drop-shadow-2xl">
                  <span className="text-white">Uygunlar</span>
                </h1>
                <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-amber-400 drop-shadow-xl mt-1">
                  Ev Tekstil
                </h2>
              </motion.div>
              <motion.p
                className="text-white/70 text-base md:text-lg mt-4 tracking-widest uppercase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Kaliteli Perde & Ev Tekstili
              </motion.p>
              <motion.div
                className="mt-6 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              </motion.div>
            </div>
          </motion.div>

          {/* Floor reflection */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-charcoal-900 to-transparent" />
        </div>
      )}
    </AnimatePresence>
  )
}
