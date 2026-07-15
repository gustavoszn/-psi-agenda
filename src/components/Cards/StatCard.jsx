import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, sub, color = 'brand', index = 0 }) {
  const iconStyle = color === 'accent'
    ? { background: 'var(--accent-light)', color: 'var(--accent-text)' }
    : { background: 'var(--brand-light)', color: 'var(--brand-text)' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: 'easeOut' }}
      className="rounded-2xl p-5 border border-token bg-surface hover:shadow-sm transition-shadow"
    >
      <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={iconStyle}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-primary mb-0.5">{value}</p>
      <p className="text-sm text-secondary">{label}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </motion.div>
  )
}
