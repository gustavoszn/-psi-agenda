import { motion } from 'framer-motion'

const variants = {
  primary:  { background: 'var(--brand)',        color: '#fff' },
  secondary:{ background: 'var(--brand-light)',  color: 'var(--brand-text)' },
  danger:   { background: 'var(--accent)',        color: '#fff' },
  ghost:    { background: 'transparent',          color: 'var(--text-secondary)' },
  outline:  { background: 'transparent',          color: 'var(--text-secondary)', border: '1px solid var(--border)' },
}

const hoverClass = {
  primary:  'hover:opacity-90',
  secondary:'hover:opacity-80',
  danger:   'hover:opacity-90',
  ghost:    'hover:bg-hover',
  outline:  'hover:bg-hover',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export default function Button({ variant = 'primary', size = 'md', className = '', loading, children, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      style={variants[variant]}
      className={`inline-flex items-center gap-2 font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${hoverClass[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
