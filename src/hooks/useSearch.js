import { useState, useMemo } from 'react'

export function useSearch(items, fields) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(item =>
      fields.some(f => String(item[f] || '').toLowerCase().includes(q))
    )
  }, [items, query, fields])

  return { query, setQuery, results }
}
