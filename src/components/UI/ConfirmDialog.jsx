import { AlertTriangle } from 'lucide-react'
import Modal from '@/components/Modal/Modal'
import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirmar', message, loading }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center"
          style={{ background: 'var(--accent-light)' }}>
          <AlertTriangle size={22} style={{ color: 'var(--accent)' }} />
        </div>
        <h3 className="text-base font-semibold text-primary mb-2">{title}</h3>
        <p className="text-sm text-secondary mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Confirmar</Button>
        </div>
      </div>
    </Modal>
  )
}
