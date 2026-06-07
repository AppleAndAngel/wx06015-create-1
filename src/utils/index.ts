export const formatPrice = (price: number): string => {
  return price.toFixed(2)
}

export const renderStars = (rating: number): string => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars)
}

export const formatSales = (sales: number): string => {
  if (sales >= 10000) {
    return (sales / 10000).toFixed(1) + '万'
  }
  return sales.toString()
}

export const formatReviewCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万+'
  }
  return count + '+'
}
