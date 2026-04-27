export function formatPrice(price: number, status?: string): string {
  if (status === 'for_rent' || status === 'rented') {
    return `฿${price.toLocaleString()}/mo`
  }
  if (price >= 1_000_000) {
    return `฿${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`
  }
  return `฿${price.toLocaleString()}`
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    for_sale: 'For Sale',
    for_rent: 'For Rent',
    sold: 'Sold',
    rented: 'Rented',
    off_market: 'Off Market',
  }
  return map[status] ?? status
}

export function typeLabel(type: string): string {
  const map: Record<string, string> = {
    house: 'House',
    condo: 'Condo',
    villa: 'Villa',
    land: 'Land',
    commercial: 'Commercial',
  }
  return map[type] ?? type
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}
