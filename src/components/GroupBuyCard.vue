<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { GroupBuyProduct } from '@/types'

const props = defineProps<{
  groupProduct: GroupBuyProduct
}>()

const router = useRouter()

const progress = computed(() => {
  return Math.round((props.groupProduct.currentCount / props.groupProduct.groupSize) * 100)
})

const goToDetail = () => {
  router.push(`/group-buy/${props.groupProduct.id}`)
}
</script>

<template>
  <div class="group-buy-card" @click="goToDetail">
    <div class="group-buy-card__badge">
      <span class="badge-text">{{ groupProduct.discount }}</span>
    </div>
    <div class="group-buy-card__image-wrap">
      <img v-lazy="groupProduct.product.images[0]" :alt="groupProduct.product.name" class="group-buy-card__image" />
    </div>
    <div class="group-buy-card__content">
      <h3 class="group-buy-card__name">{{ groupProduct.product.name }}</h3>
      <div class="group-buy-card__progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="progress-text">还差{{ groupProduct.groupSize - groupProduct.currentCount }}人成团</span>
      </div>
      <div class="group-buy-card__bottom">
        <div class="group-buy-card__prices">
          <span class="group-price">¥{{ groupProduct.groupPrice.toFixed(1) }}</span>
          <span class="original-price">¥{{ groupProduct.originalPrice.toFixed(1) }}</span>
        </div>
        <div class="group-buy-card__btn">
          去拼团
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.group-buy-card {
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  overflow: hidden;
  position: relative;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
    box-shadow: $shadow-lg;
  }

  &__badge {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    background: linear-gradient(135deg, #FF6B35, #FF8C42);
    padding: 4px 10px;
    border-radius: 0 0 $radius-sm 0;

    .badge-text {
      color: #fff;
      font-size: 12px;
      font-weight: 600;
    }
  }

  &__image-wrap {
    width: 100%;
    padding-top: 100%;
    position: relative;
  }

  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__content {
    padding: 10px 12px 12px;
  }

  &__name {
    @include text-ellipsis-2;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    height: 2.8em;
    color: $text-primary;
    margin-bottom: 8px;
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #FFE8DC;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #FF6B35, #FF8C42);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      flex-shrink: 0;
      font-size: 11px;
      color: #FF6B35;
      font-weight: 500;
    }
  }

  &__bottom {
    @include flex-between;
  }

  &__prices {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  &__btn {
    background: linear-gradient(135deg, #FF6B35, #FF8C42);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 16px;
    transition: opacity 0.2s ease;

    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}

.group-price {
  color: #FF6B35;
  font-weight: 700;
  font-size: 18px;

  &::before {
    content: '¥';
    font-size: 0.75em;
  }
}

.original-price {
  color: $text-secondary;
  text-decoration: line-through;
  font-size: 12px;

  &::before {
    content: '¥';
  }
}
</style>
