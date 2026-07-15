import { AlertTriangle } from 'lucide-react'
import Modal from '@/components/Modal/Modal'
import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirmar', message, loading }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--accent-light)' }}>
          <AlertTriangle size={24} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h3 className="text-base font-bold text-primary mb-1">{title}</h3>
          <p className="text-sm text-secondary">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">Confirmar</Button>
        </div>
      </div>
    </Modal>
  )
}
