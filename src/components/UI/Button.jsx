import { motion } from 'framer-motion'

const VARIANTS = {
  primary:  { bg: 'var(--brand)',       color: '#fff',                    hover: 'var(--brand-hover)' },
  secondary:{ bg: 'var(--brand-light)', color: 'var(--brand-text)',       hover: 'var(--bg-active)'   },
  danger:   { bg: 'var(--accent)',      color: '#fff',                    hover: '#a8503f'            },
  ghost:    { bg: 'transparent',        color: 'var(--text-secondary)',   hover: 'var(--bg-hover)'    },
  outline:  { bg: 'transparent',        color: 'var(--text-secondary)',   hover: 'var(--bg-hover)',
              border: '1.5px solid var(--border)' },
}

const SIZES = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-sm gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  ...props
}) {
  const v = VARIANTS[variant] || VARIANTS.primary

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ opacity: 0.92 }}
      style={{
        background: v.bg,
        color: v.color,
        border: v.border || 'none',
        boxShadow: variant === 'primary' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
      }}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-150 cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        focus-visible:outline-2 focus-visible:outline-offset-2
        ${SIZES[size]} ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
