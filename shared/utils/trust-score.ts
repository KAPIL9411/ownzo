export interface TrustScoreData {
  verified: boolean
  completedSales: number
  positiveReviews: number
  negativeReviews: number
  profileComplete: boolean
  reported: number
}

export function calculateTrustScore(data: TrustScoreData): number {
  let score = 0

  if (data.verified) score += 20
  score += Math.min(data.completedSales * 5, 30)
  score += Math.min(data.positiveReviews * 3, 25)
  score -= data.negativeReviews * 5
  if (data.profileComplete) score += 5
  score -= data.reported * 10

  return Math.max(0, Math.min(100, score))
}
