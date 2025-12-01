import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useUIStore from '../../store/uiStore'

export default function CurtainAnimation() {
  const { showCurtain, hideCurtain, setCurtainAnimationComplete } = useUIStore()
  const [isAnimating, setIsAnimating] = useState(true)
  const [logoPosition, setLogoPosition] = useState('center') // 'center' -> 'header'

  useEffect(() => {
    // Check if animation was already shown in this session
    const hasSeenAnimation = sessionStorage.getItem('curtainAnimationShown')
    
    if (hasSeenAnimation) {
      hideCurtain()
      setCurtainAnimationComplete()
      setIsAnimating(false)
      return
    }

    // Logo moves to header position after 2 seconds
    const logoTimer = setTimeout(() => {
      setLogoPosition('header')
    }, 2000)

    // Start curtain opening animation
    const curtainTimer = setTimeout(() => {
      setIsAnimating(false)
      sessionStorage.setItem('curtainAnimationShown', 'true')
    }, 3500)

    return () => {
      clearTimeout(logoTimer)
      clearTimeout(curtainTimer)
    }
  }, [hideCurtain, setCurtainAnimationComplete])

  const handleAnimationComplete = () => {
    hideCurtain()
    setCurtainAnimationComplete()
  }

  if (!showCurtain) return null

  // Create pleated curtain fold pattern
  const createPleats = (count, isLeft = true) => {
    return [...Array(count)].map((_, i) => {
      const depth = Math.sin((i / count) * Math.PI) * 0.3 + 0.1
      return (
        <div
          key={i}
          className="absolute top-0 h-full"
          style={{
            left: `${(i / count) * 100}%`,
            width: `${100 / count}%`,
            background: `linear-gradient(${isLeft ? '90deg' : '270deg'}, 
              rgba(0,0,0,${depth}) 0%, 
              transparent 40%,
              transparent 60%,
              rgba(0,0,0,${depth * 0.7}) 100%)`,
          }}
        />
      )
    })
  }

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isAnimating && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Theater stage background - dark luxurious */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a0a] via-[#0d0505] to-black" />
          
          {/* Dramatic spotlight effect */}
          <div className="absolute inset-0">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-full"
              style={{
                background: 'radial-gradient(ellipse at center top, rgba(255,200,100,0.15) 0%, transparent 60%)'
              }}
            />
          </div>

          {/* Left curtain panel - RED VELVET THEATER CURTAIN */}
          <motion.div
            className="absolute top-0 left-0 w-1/2 h-full origin-left"
            initial={{ x: 0, scaleX: 1 }}
            animate={{ x: '-100%', scaleX: 0.85 }}
            exit={{ x: '-100%' }}
            transition={{
              duration: 2.0,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 1.5,
            }}
          >
            {/* Rich red velvet base */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #8B0000 0%, #B22222 20%, #DC143C 40%, #8B0000 60%, #5C0000 80%, #3D0000 100%)',
              }}
            >
              {/* Vertical pleats/folds */}
              <div className="absolute inset-0 flex">
                {[...Array(16)].map((_, i) => {
                  const isEven = i % 2 === 0
                  return (
                    <div
                      key={i}
                      className="flex-1 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, 
                          rgba(0,0,0,${isEven ? 0.4 : 0.1}) 0%, 
                          rgba(255,50,50,${isEven ? 0.1 : 0.15}) 30%,
                          rgba(255,100,100,${isEven ? 0.05 : 0.1}) 50%,
                          rgba(255,50,50,${isEven ? 0.1 : 0.15}) 70%,
                          rgba(0,0,0,${isEven ? 0.1 : 0.4}) 100%)`,
                      }}
                    >
                      {/* Highlight on folds */}
                      <div 
                        className="absolute top-0 left-1/4 w-1/2 h-full opacity-20"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,200,200,0.5), transparent)'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              
              {/* Velvet texture overlay */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)'
                }}
              />
              
              {/* Silk sheen highlight */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)'
                }}
              />
            </div>
            
            {/* Deep shadow on edge */}
            <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-black/70 to-transparent" />
            
            {/* Gold tie-back */}
            <motion.div 
              className="absolute top-[15%] right-6 w-3 h-40 rounded-full opacity-0"
              style={{
                background: 'linear-gradient(180deg, #D4AF37 0%, #FFD700 30%, #B8860B 70%, #8B6914 100%)',
                boxShadow: '2px 4px 10px rgba(0,0,0,0.5)'
              }}
              animate={{ opacity: [0, 1, 1] }}
              transition={{ duration: 0.5, delay: 1.8 }}
            />
            
            {/* Gold tassel */}
            <motion.div 
              className="absolute top-[35%] right-4 flex flex-col items-center opacity-0"
              animate={{ opacity: [0, 1, 1] }}
              transition={{ duration: 0.5, delay: 2 }}
            >
              <div 
                className="w-8 h-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #FFD700 0%, #B8860B 100%)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
                }}
              />
              {/* Tassel threads */}
              <div className="flex gap-0.5">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 h-16 rounded-b-full"
                    style={{
                      background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 50%, #8B6914 100%)',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right curtain panel - RED VELVET THEATER CURTAIN */}
          <motion.div
            className="absolute top-0 right-0 w-1/2 h-full origin-right"
            initial={{ x: 0, scaleX: 1 }}
            animate={{ x: '100%', scaleX: 0.85 }}
            exit={{ x: '100%' }}
            transition={{
              duration: 2.0,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 1.5,
            }}
          >
            {/* Rich red velvet base */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(225deg, #8B0000 0%, #B22222 20%, #DC143C 40%, #8B0000 60%, #5C0000 80%, #3D0000 100%)',
              }}
            >
              {/* Vertical pleats/folds - mirrored */}
              <div className="absolute inset-0 flex">
                {[...Array(16)].map((_, i) => {
                  const isEven = i % 2 === 0
                  return (
                    <div
                      key={i}
                      className="flex-1 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(270deg, 
                          rgba(0,0,0,${isEven ? 0.4 : 0.1}) 0%, 
                          rgba(255,50,50,${isEven ? 0.1 : 0.15}) 30%,
                          rgba(255,100,100,${isEven ? 0.05 : 0.1}) 50%,
                          rgba(255,50,50,${isEven ? 0.1 : 0.15}) 70%,
                          rgba(0,0,0,${isEven ? 0.1 : 0.4}) 100%)`,
                      }}
                    >
                      {/* Highlight on folds */}
                      <div 
                        className="absolute top-0 left-1/4 w-1/2 h-full opacity-20"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,200,200,0.5), transparent)'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              
              {/* Velvet texture overlay */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)'
                }}
              />
              
              {/* Silk sheen highlight */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(200deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)'
                }}
              />
            </div>
            
            {/* Deep shadow on edge */}
            <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-black/70 to-transparent" />
            
            {/* Gold tie-back */}
            <motion.div 
              className="absolute top-[15%] left-6 w-3 h-40 rounded-full opacity-0"
              style={{
                background: 'linear-gradient(180deg, #D4AF37 0%, #FFD700 30%, #B8860B 70%, #8B6914 100%)',
                boxShadow: '-2px 4px 10px rgba(0,0,0,0.5)'
              }}
              animate={{ opacity: [0, 1, 1] }}
              transition={{ duration: 0.5, delay: 1.8 }}
            />
            
            {/* Gold tassel */}
            <motion.div 
              className="absolute top-[35%] left-4 flex flex-col items-center opacity-0"
              animate={{ opacity: [0, 1, 1] }}
              transition={{ duration: 0.5, delay: 2 }}
            >
              <div 
                className="w-8 h-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #FFD700 0%, #B8860B 100%)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
                }}
              />
              {/* Tassel threads */}
              <div className="flex gap-0.5">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 h-16 rounded-b-full"
                    style={{
                      background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 50%, #8B6914 100%)',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Top valance/pelmet - RED with GOLD trim */}
          <div className="absolute top-0 left-0 right-0 h-28 z-10">
            {/* Main valance */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, #5C0000 0%, #8B0000 30%, #B22222 50%, #8B0000 70%, #5C0000 100%)'
              }}
            />
            
            {/* Decorative scalloped bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-10 flex overflow-hidden">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{
                    background: 'linear-gradient(180deg, #8B0000 0%, #B22222 40%, #5C0000 100%)',
                    borderRadius: '0 0 50% 50%',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
                  }}
                />
              ))}
            </div>
            
            {/* Gold trim line at bottom */}
            <div 
              className="absolute bottom-10 left-0 right-0 h-2"
              style={{
                background: 'linear-gradient(90deg, #8B6914, #D4AF37, #FFD700, #D4AF37, #8B6914, #D4AF37, #FFD700, #D4AF37, #8B6914)'
              }}
            />
            
            {/* Top gold trim */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: 'linear-gradient(90deg, #8B6914, #FFD700, #D4AF37, #FFD700, #8B6914)'
              }}
            />
          </div>

          {/* Animated Logo - starts center, moves to top-left */}
          <motion.div
            className="absolute z-20 pointer-events-none"
            initial={{ 
              top: '50%', 
              left: '50%', 
              x: '-50%', 
              y: '-50%',
              scale: 1 
            }}
            animate={logoPosition === 'header' ? { 
              top: '140px', 
              left: '40px', 
              x: '0%', 
              y: '0%',
              scale: 0.5
            } : {
              top: '50%', 
              left: '50%', 
              x: '-50%', 
              y: '-50%',
              scale: 1
            }}
            transition={{
              duration: 1.0,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <div className="text-center">
              {/* Main logo text */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                {/* Gold glow effect */}
                <div 
                  className="absolute inset-0 blur-2xl opacity-50"
                  style={{
                    background: 'radial-gradient(ellipse, #FFD700 0%, transparent 70%)'
                  }}
                />
                
                <h1 
                  className="font-display text-5xl md:text-7xl lg:text-8xl font-bold relative"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #B8860B 75%, #FFD700 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 0 40px rgba(255,215,0,0.5)',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                  }}
                >
                  Uygunlar Ev Tekstil
                </h1>
              </motion.div>
              
              {/* Subtitle - only visible in center */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: logoPosition === 'center' ? 1 : 0, 
                  y: logoPosition === 'center' ? 0 : -20 
                }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <p 
                  className="text-lg md:text-xl mt-4 tracking-[0.3em] uppercase"
                  style={{
                    color: '#D4AF37',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  Premium Perde & Ev Tekstili
                </p>
                
                {/* Decorative line */}
                <div className="mt-6 flex justify-center">
                  <div 
                    className="w-32 h-0.5"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #FFD700, transparent)'
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Floor reflection effect */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
            }}
          />
          
          {/* Stage floor wood texture hint */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-4"
            style={{
              background: 'linear-gradient(90deg, #2a1810, #3d2415, #2a1810, #3d2415, #2a1810)'
            }}
          />
        </div>
      )}
    </AnimatePresence>
  )
}
