export function getListingExpiryDays(
  createdAt: Date | string,
  expiryDays: number = 30
): Date {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const expiryDate = new Date(date)
  expiryDate.setDate(expiryDate.getDate() + expiryDays)
  return expiryDate
}

export function isListingExpired(expiresAt: Date | string | undefined): boolean {
  if (!expiresAt) return false
  const date = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
  return date < new Date()
}
