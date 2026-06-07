import React from 'react'
import { View, Text } from '@tarojs/components'
import EmptyState from '@/components/EmptyState'
import styles from './index.module.scss'

const OrderPage: React.FC = () => {
  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <EmptyState
          icon='📋'
          title='订单功能'
          description='订单功能开发中，敬请期待...'
        />
      </View>
    </View>
  )
}

export default OrderPage
