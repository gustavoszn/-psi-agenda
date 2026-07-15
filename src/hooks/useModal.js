import { useState, useCallback } from 'react'

export function useModal(initial = false) {
  const [open, setOpen] = useState(initial)
  const [data, setData] = useState(null)

  const show = useCallback((d = null) => { setData(d); setOpen(true) }, [])
  const hide = useCallback(() => { setOpen(false); setData(null) }, [])

  return { open, data, show, hide }
}
