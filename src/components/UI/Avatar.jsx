import { getInitials } from '@/utils/helpers'

const SIZES = {
  xs: { box: 'h-6 w-6',   text: 'text-[9px]'  },
  sm: { box: 'h-8 w-8',   text: 'text-xs'     },
  md: { box: 'h-10 w-10', text: 'text-sm'     },
  lg: { box: 'h-12 w-12', text: 'text-base'   },
  xl: { box: 'h-16 w-16', text: 'text-lg'     },
  '2xl':{ box: 'h-20 w-20', text: 'text-xl'   },
}

const COLORS = [
  ['#d1ead8','#2d5a3d'], ['#dde8f5','#1e3a5f'], ['#f5e0e0','#7a2020'],
  ['#fef3d0','#7a5500'], ['#e8dff5','#4a2080'], ['#d0f0f0','#1a5555'],
  ['#fde8d8','#7a3a10'], ['#e0f0e8','#1a4a30'],
]

const getColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length]

export default function Avatar({ name = '', photo, size = 'md', className = '' }) {
  const s = SIZES[size] || SIZES.md
  const [bg, fg] = getColor(name)

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${s.box} rounded-full object-cover flex-shrink-0 ring-2 ring-white/20 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${s.box} ${s.text} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
      style={{ background: bg, color: fg }}
    >
      {getInitials(name)}
    </div>
  )
}
