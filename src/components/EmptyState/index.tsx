import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title = '暂无数据',
  description = '快去添加一些商品吧~'
}) => {
  return (
    <View className={styles.container}>
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.title}>{title}</Text>
      {description && <Text className={styles.desc}>{description}</Text>}
    </View>
  )
}

export default EmptyState
