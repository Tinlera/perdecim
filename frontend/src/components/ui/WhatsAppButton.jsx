import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const phoneNumber = '905551234567' // Telefon numarası
  const defaultMessage = 'Merhaba, perdeler hakkında bilgi almak istiyorum.'

  const handleSend = () => {
    const text = message.trim() || defaultMessage
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
    setMessage('')
  }

  const quickMessages = [
    'Fiyat bilgisi almak istiyorum',
    'Ücretsiz ölçü hizmeti hakkında bilgi',
    'Kumaş numunesi sipariş etmek istiyorum',
    'Montaj hizmeti var mı?',
  ]

  return (
    <>
      {/* Floating WhatsApp Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-8 h-8 text-white fill-white" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pulse animation */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        )}
      </motion.button>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-[#075E54] p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Uygunlar Ev Tekstil</h3>
                  <p className="text-white/80 text-sm">Genellikle 5 dakika içinde yanıt verir</p>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-[#ECE5DD] min-h-[200px]">
              {/* Welcome Message */}
              <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%] mb-4">
                <p className="text-gray-800 text-sm">
                  Merhaba! 👋 Size nasıl yardımcı olabiliriz?
                </p>
                <span className="text-[10px] text-gray-400 mt-1 block text-right">
                  {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Quick Messages */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">Hızlı Mesajlar:</p>
                {quickMessages.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(msg)}
                    className="block w-full text-left text-sm bg-white hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors border border-gray-100"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#F0F0F0] border-t">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-2.5 bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
                />
                <button
                  onClick={handleSend}
                  className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-[#128C7E] transition-colors"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip for first-time visitors */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 2 }}
            className="fixed bottom-8 right-24 z-40 bg-white px-4 py-2 rounded-lg shadow-lg hidden sm:block"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-white" />
            <p className="text-sm text-gray-700 whitespace-nowrap">
              💬 Sorularınız mı var? Bize yazın!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

