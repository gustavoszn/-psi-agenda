export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-secondary">{label}</label>}
      <input
        className={`w-full px-3 py-2 rounded-xl text-sm text-primary placeholder-muted transition-all
          focus:outline-none focus:ring-2
          ${error ? 'ring-2' : ''}
          ${className}`}
        style={{
          background: 'var(--bg-hover)',
          border: `1px solid ${error ? 'var(--accent)' : 'var(--border)'}`,
          '--tw-ring-color': error ? 'var(--accent-light)' : 'var(--brand-light)',
        }}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: 'var(--accent-text)' }}>{error}</p>}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-secondary">{label}</label>}
      <select
        className={`w-full px-3 py-2 rounded-xl text-sm text-primary transition-all focus:outline-none focus:ring-2 ${className}`}
        style={{
          background: 'var(--bg-hover)',
          border: `1px solid ${error ? 'var(--accent)' : 'var(--border)'}`,
          '--tw-ring-color': 'var(--brand-light)',
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs" style={{ color: 'var(--accent-text)' }}>{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-secondary">{label}</label>}
      <textarea
        className={`w-full px-3 py-2 rounded-xl text-sm text-primary placeholder-muted transition-all resize-none focus:outline-none focus:ring-2 ${className}`}
        style={{
          background: 'var(--bg-hover)',
          border: `1px solid ${error ? 'var(--accent)' : 'var(--border)'}`,
          '--tw-ring-color': 'var(--brand-light)',
        }}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: 'var(--accent-text)' }}>{error}</p>}
    </div>
  )
}
