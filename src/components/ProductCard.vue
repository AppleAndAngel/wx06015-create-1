<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Product } from '@/types'

const props = withDefaults(defineProps<{
  product: Product
  mode?: 'grid' | 'list'
}>(), {
  mode: 'grid'
})

const router = useRouter()

const tagClass = (tag: string) => {
  if (tag === '有机') return 'tag--organic'
  if (tag === '产地直发') return 'tag--direct'
  return 'tag--default'
}

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}
</script>

<template>
  <div :class="['product-card', `product-card--${mode}`]" @click="goToDetail">
    <div class="product-card__image-wrap">
      <img v-lazy="product.images[0]" :alt="product.name" class="product-card__image" />
    </div>
    <div class="product-card__content">
      <h3 class="product-card__name">{{ product.name }}</h3>
      <div class="product-card__tags" v-if="product.tags?.length">
        <span v-for="tag in product.tags" :key="tag" :class="['tag', tagClass(tag)]">{{ tag }}</span>
      </div>
      <div class="product-card__bottom">
        <div class="product-card__prices">
          <span class="price">{{ product.price.toFixed(2) }}</span>
          <span class="price-original" v-if="product.originalPrice > product.price">
            {{ product.originalPrice.toFixed(2) }}
          </span>
        </div>
        <span class="product-card__sales">已售{{ product.sales }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

.product-card {
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
    box-shadow: $shadow-lg;
  }

  &--grid {
    display: flex;
    flex-direction: column;

    .product-card__image-wrap {
      width: 100%;
      padding-top: 100%;
      position: relative;
    }

    .product-card__image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-card__content {
      padding: 10px 12px 12px;
    }

    .product-card__name {
      @include text-ellipsis-2;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      height: 2.8em;
      color: $text-primary;
    }

    .product-card__bottom {
      @include flex-between;
      margin-top: 8px;
    }
  }

  &--list {
    display: flex;
    flex-direction: row;

    .product-card__image-wrap {
      width: 120px;
      min-width: 120px;
      height: 120px;
      position: relative;
      flex-shrink: 0;
    }

    .product-card__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-card__content {
      flex: 1;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0;
    }

    .product-card__name {
      @include text-ellipsis-2;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      color: $text-primary;
    }

    .product-card__bottom {
      @include flex-between;
      margin-top: auto;
    }
  }

  &__tags {
    display: flex;
    gap: 4px;
    margin-top: 6px;
    flex-wrap: wrap;
  }

  &__prices {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  &__sales {
    font-size: 11px;
    color: $text-secondary;
    white-space: nowrap;
  }
}

.tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;

  &--organic {
    background: $primary-light;
    color: $primary;
  }

  &--direct {
    background: $accent-light;
    color: $accent;
  }

  &--default {
    background: $bg-gray;
    color: $text-secondary;
  }
}

.price {
  color: $danger;
  font-weight: 700;
  font-size: 16px;

  &::before {
    content: '¥';
    font-size: 0.75em;
  }
}

.price-original {
  color: $text-secondary;
  text-decoration: line-through;
  font-size: 12px;
  font-weight: 400;

  &::before {
    content: '¥';
  }
}
</style>
