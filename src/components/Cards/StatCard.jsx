import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, sub, color = 'brand', index = 0 }) {
  const isAccent = color === 'accent'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: 'easeOut' }}
      className="rounded-2xl p-4 border border-token bg-surface shadow-card hover:shadow-panel transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center"
          style={{
            background: isAccent ? 'var(--accent-light)' : 'var(--brand-light)',
            color: isAccent ? 'var(--accent-text)' : 'var(--brand-text)',
          }}>
          <Icon size={17} />
        </div>
      </div>
      <p className="text-2xl font-bold text-primary leading-none mb-1">{value}</p>
      <p className="text-xs font-medium text-secondary">{label}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </motion.div>
  )
}
