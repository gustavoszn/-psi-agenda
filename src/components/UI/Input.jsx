const baseInput = `
  w-full px-3.5 py-2.5 rounded-xl text-sm text-primary placeholder:text-muted
  transition-all duration-150 focus:outline-none focus:ring-2
  disabled:opacity-50 disabled:cursor-not-allowed
`

const inputStyle = (error) => ({
  background: 'var(--bg-hover)',
  border: `1.5px solid ${error ? 'var(--accent)' : 'var(--border)'}`,
  '--tw-ring-color': error ? 'var(--accent-light)' : 'var(--brand-light)',
})

export default function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        className={`${baseInput} ${className}`}
        style={inputStyle(error)}
        {...props}
      />
      {error && <p className="text-xs font-medium" style={{ color: 'var(--accent-text)' }}>{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}

export function Select({ label, error, hint, className = '', children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <select
        className={`${baseInput} cursor-pointer ${className}`}
        style={inputStyle(error)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium" style={{ color: 'var(--accent-text)' }}>{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}

export function Textarea({ label, error, hint, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <textarea
        className={`${baseInput} resize-none ${className}`}
        style={inputStyle(error)}
        {...props}
      />
      {error && <p className="text-xs font-medium" style={{ color: 'var(--accent-text)' }}>{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}
