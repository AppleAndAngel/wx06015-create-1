<script setup lang="ts">
import { ref, watch } from 'vue'
import { Popup, Stepper, Button } from 'vant'
import type { Product } from '@/types'

const props = defineProps<{
  product: Product | null
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  confirm: [specValues: Record<string, string>, quantity: number]
}>()

const selectedSpecs = ref<Record<string, string>>({})
const quantity = ref(1)

watch(() => props.show, (val) => {
  if (val && props.product) {
    selectedSpecs.value = {}
    quantity.value = 1
  }
})

const selectSpec = (specName: string, value: string) => {
  selectedSpecs.value = { ...selectedSpecs.value, [specName]: value }
}

const handleConfirm = () => {
  if (!props.product) return
  emit('confirm', { ...selectedSpecs.value }, quantity.value)
  emit('update:show', false)
}

const onClose = () => {
  emit('update:show', false)
}
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    closeable
    @close="onClose"
    :style="{ maxHeight: '75vh' }"
  >
    <div class="spec-popup" v-if="product">
      <div class="spec-popup__header">
        <img :src="product.images[0]" class="spec-popup__image" :alt="product.name" />
        <div class="spec-popup__info">
          <h3 class="spec-popup__name">{{ product.name }}</h3>
          <span class="spec-popup__price">¥{{ product.price.toFixed(2) }}</span>
        </div>
      </div>

      <div class="spec-popup__body">
        <div v-for="spec in product.specs" :key="spec.name" class="spec-popup__group">
          <h4 class="spec-popup__group-title">{{ spec.name }}</h4>
          <div class="spec-popup__group-values">
            <span
              v-for="val in spec.values"
              :key="val"
              :class="['spec-popup__tag', { 'spec-popup__tag--active': selectedSpecs[spec.name] === val }]"
              @click="selectSpec(spec.name, val)"
            >
              {{ val }}
            </span>
          </div>
        </div>

        <div class="spec-popup__quantity">
          <span class="spec-popup__quantity-label">数量</span>
          <van-stepper v-model="quantity" :min="1" />
        </div>
      </div>

      <van-button type="primary" block round class="spec-popup__confirm" @click="handleConfirm">
        确认
      </van-button>
    </div>
  </van-popup>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.spec-popup {
  padding: 20px 16px calc(16px + env(safe-area-inset-bottom));

  &__header {
    display: flex;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid $border;
  }

  &__image {
    width: 90px;
    height: 90px;
    border-radius: $radius-sm;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  &__name {
    font-size: 15px;
    font-weight: 500;
    color: $text-primary;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-bottom: 8px;
  }

  &__price {
    color: $danger;
    font-size: 20px;
    font-weight: 700;

    &::before {
      content: '¥';
      font-size: 0.6em;
    }
  }

  &__body {
    padding: 16px 0;
    max-height: 50vh;
    overflow-y: auto;
  }

  &__group {
    margin-bottom: 20px;

    &-title {
      font-size: 14px;
      font-weight: 500;
      color: $text-primary;
      margin-bottom: 10px;
    }

    &-values {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  &__tag {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    background: $bg-gray;
    color: $text-primary;
    border: 1.5px solid transparent;
    transition: all 0.2s ease;
    cursor: pointer;

    &--active {
      background: $primary-light;
      color: $primary;
      border-color: $primary;
    }
  }

  &__quantity {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-label {
      font-size: 14px;
      font-weight: 500;
      color: $text-primary;
    }
  }

  &__confirm {
    margin-top: 16px;
    background: $primary !important;
    border-color: $primary !important;
  }
}
</style>
