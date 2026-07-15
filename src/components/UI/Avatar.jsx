import { getInitials, getAvatarColor } from '@/utils/helpers'

export default function Avatar({ name, photo, size = 'md', className = '' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' }

  if (photo) {
    return <img src={photo} alt={name} className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`} />
  }

  return (
    <div className={`${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  )
}
