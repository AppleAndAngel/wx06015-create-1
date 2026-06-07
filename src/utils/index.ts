export const formatPrice = (price: number): string => {
  return price.toFixed(2)
}

export const formatSales = (sales: number): string => {
  if (sales >= 10000) {
    return (sales / 10000).toFixed(1) + '万'
  }
  return sales.toString()
}

export const renderStars = (rating: number): string => {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  let stars = ''
  for (let i = 0; i < fullStars; i++) {
    stars += '★'
  }
  if (hasHalf) {
    stars += '☆'
  }
  const emptyStars = 5 - Math.ceil(rating)
  for (let i = 0; i < emptyStars; i++) {
    stars += '☆'
  }
  return stars
}
