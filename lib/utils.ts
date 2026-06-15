import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  try {
    return format(new Date(date), "d MMM, HH:mm", { locale: es })
  } catch { return '' }
}

export function formatRelativeDate(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  } catch { return '' }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getImageUrl(path?: string): string {
  if (!path) return '/placeholder.jpg'
  if (path.startsWith('http')) return path
  return `${process.env.NEXT_PUBLIC_API_URL || 'https://api2.diarioinfo.com'}/${path}`
}