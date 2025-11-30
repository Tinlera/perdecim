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
    }, 2500)

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
        <div className="curtain">
          {/* Left curtain panel */}
          <motion.div
            className="curtain-panel curtain-left"
            initial={{ x: 0 }}
            animate={{ x: '-100%' }}
            exit={{ x: '-100%' }}
            transition={{
              duration: 1.5,
              ease: [0.43, 0.13, 0.23, 0.96],
              delay: 1,
            }}
          >
            {/* Curtain folds */}
            <div className="absolute inset-0 flex">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-gold-600/30"
                  style={{
                    background: `linear-gradient(180deg, 
                      rgba(184, 150, 12, ${0.3 + i * 0.05}) 0%, 
                      rgba(212, 175, 55, ${0.5 + i * 0.03}) 50%, 
                      rgba(184, 150, 12, ${0.3 + i * 0.05}) 100%)`,
                  }}
                />
              ))}
            </div>
            {/* Curtain drape effect */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gold-700/50 to-transparent" />
          </motion.div>

          {/* Right curtain panel */}
          <motion.div
            className="curtain-panel curtain-right"
            initial={{ x: 0 }}
            animate={{ x: '100%' }}
            exit={{ x: '100%' }}
            transition={{
              duration: 1.5,
              ease: [0.43, 0.13, 0.23, 0.96],
              delay: 1,
            }}
          >
            {/* Curtain folds */}
            <div className="absolute inset-0 flex">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-l border-gold-600/30"
                  style={{
                    background: `linear-gradient(180deg, 
                      rgba(184, 150, 12, ${0.3 + (7 - i) * 0.05}) 0%, 
                      rgba(212, 175, 55, ${0.5 + (7 - i) * 0.03}) 50%, 
                      rgba(184, 150, 12, ${0.3 + (7 - i) * 0.05}) 100%)`,
                  }}
                />
              ))}
            </div>
            {/* Curtain drape effect */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gold-700/50 to-transparent" />
          </motion.div>

          {/* Center logo/text */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="text-center">
              <motion.h1
                className="font-display text-5xl md:text-7xl text-white drop-shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Perdecim
              </motion.h1>
              <motion.p
                className="text-white/80 text-lg mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Premium Perde & Ev Tekstili
              </motion.p>
            </div>
          </motion.div>

          {/* Top valance */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gold-800 to-gold-600 z-20">
            <div className="absolute bottom-0 left-0 right-0 h-4 flex">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{
                    background: 'linear-gradient(180deg, #B8960C 0%, #D4AF37 100%)',
                    borderRadius: '0 0 50% 50%',
                    transform: 'scaleY(1.5)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
