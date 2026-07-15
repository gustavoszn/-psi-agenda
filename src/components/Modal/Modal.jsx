import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
            className={`
              relative w-full ${SIZES[size]} shadow-modal border border-token
              rounded-t-3xl sm:rounded-3xl overflow-hidden
            `}
            style={{ background: 'var(--bg-surface)' }}
          >
            {/* Handle bar mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border)' }} />
            </div>

            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-token">
                <h2 className="text-base font-bold text-primary">{title}</h2>
                <button onClick={onClose}
                  className="p-1.5 rounded-xl transition-colors hover:bg-hover"
                  style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="overflow-y-auto max-h-[85vh] sm:max-h-[80vh]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
