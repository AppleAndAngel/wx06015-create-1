<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  SwipeCell,
  Checkbox,
  Stepper,
  Button,
  showToast,
  showConfirmDialog,
  showLoadingToast,
  closeToast,
  Popup,
  Picker,
  Field,
} from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useStockpileStore } from '@/stores/stockpile'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { formatPrice } from '@/utils/format'
import dayjs from 'dayjs'

const router = useRouter()
const stockpileStore = useStockpileStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const { items, categories, selectedCategory, totalCount, selectedCount, totalAmount, loading, categoryCountMap } = storeToRefs(stockpileStore)

const showCategoryPicker = ref(false)
const showNotePopup = ref(false)
const currentEditItem = ref<any>(null)
const noteText = ref('')

const allCategories = computed(() => [
  { id: 'all', name: '全部', icon: '📋' },
  ...categories.value,
])

const isAllSelected = computed(() => items.value.length > 0 && selectedCount.value === items.value.length)

const categoryColumns = computed(() => [
  categories.value.map((cat) => ({
    text: `${cat.icon} ${cat.name}`,
    value: cat.id,
  })),
])

function specText(specValues: Record<string, string>) {
  return Object.values(specValues).join(' / ')
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '从未购买'
  return dayjs(dateStr).format('MM-DD')
}

function getCategoryInfo(categoryId: string) {
  return categories.value.find((c) => c.id === categoryId) || { icon: '📦', name: '其他' }
}

function onCategoryChange(categoryId: string) {
  stockpileStore.setCategory(categoryId)
}

function onToggleSelect(id: number) {
  stockpileStore.toggleSelect(id)
}

function onToggleSelectAll() {
  stockpileStore.toggleSelectAll()
}

async function onDelete(id: number, productName: string) {
  try {
    await showConfirmDialog({
      title: '提示',
      message: `确定要将「${productName}」从囤货清单中移除吗？`,
    })
    showLoadingToast({ message: '删除中...', forbidClick: true })
    await stockpileStore.removeItem(id)
    closeToast()
    showToast({ message: '已移除', type: 'success' })
  } catch (e) {
    // 用户取消
  }
}

function onQuantityChange(id: number, quantity: number) {
  stockpileStore.updateQuantity(id, quantity)
}

function openNotePopup(item: any) {
  currentEditItem.value = item
  noteText.value = item.note || ''
  showNotePopup.value = true
}

async function saveNote() {
  if (!currentEditItem.value) return
  try {
    showLoadingToast({ message: '保存中...', forbidClick: true })
    await stockpileStore.updateNote(currentEditItem.value.id, noteText.value)
    closeToast()
    showNotePopup.value = false
    showToast({ message: '已保存', type: 'success' })
  } catch (e) {
    closeToast()
    showToast({ message: '保存失败', type: 'fail' })
  }
}

async function onAddSelectedToCart() {
  if (selectedCount.value === 0) {
    showToast({ message: '请先选择商品', type: 'fail' })
    return
  }
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/stockpile' } })
    return
  }
  try {
    showLoadingToast({ message: '加入购物车中...', forbidClick: true })
    const result = await stockpileStore.addSelectedToCart()
    await cartStore.fetchCart()
    closeToast()
    showToast({ message: `成功加入 ${result.successCount} 件商品`, type: 'success' })
  } catch (e: any) {
    closeToast()
    showToast({ message: e.message || '加入失败', type: 'fail' })
  }
}

async function onAddAllToCart() {
  if (totalCount.value === 0) {
    showToast({ message: '囤货清单为空', type: 'fail' })
    return
  }
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: '/stockpile' } })
    return
  }
  try {
    await showConfirmDialog({
      title: '一键加入购物车',
      message: `确定要将全部 ${totalCount.value} 件商品加入购物车吗？`,
    })
    showLoadingToast({ message: '加入购物车中...', forbidClick: true })
    const result = await stockpileStore.addAllToCart()
    await cartStore.fetchCart()
    closeToast()
    showToast({ message: `成功加入 ${result.successCount} 件商品`, type: 'success' })
  } catch (e: any) {
    closeToast()
    if (e.message !== 'cancel') {
      showToast({ message: e.message || '加入失败', type: 'fail' })
    }
  }
}

function goShopping() {
  router.push('/')
}

function onConfirmCategory(value: any) {
  const selected = value[0]
  if (currentEditItem.value) {
    stockpileStore.addItem(
      currentEditItem.value.product,
      currentEditItem.value.specValues,
      currentEditItem.value.quantity,
      selected.value,
      currentEditItem.value.note
    ).then(() => {
      showToast({ message: '分类已更新', type: 'success' })
    }).catch(() => {
      showToast({ message: '更新失败', type: 'fail' })
    })
  }
  showCategoryPicker.value = false
}

function openCategoryPicker(item: any) {
  currentEditItem.value = item
  showCategoryPicker.value = true
}

onMounted(async () => {
  try {
    await Promise.all([
      stockpileStore.fetchCategories(),
      stockpileStore.fetchList(),
    ])
  } catch (e) {
    console.error('[Stockpile] 加载数据失败', e)
  }
})
</script>

<template>
  <div class="stockpile-page">
    <AppHeader title="家庭囤货清单" :show-back="true" @click-left="router.back()" />

    <div class="stockpile-content">
      <div class="category-tabs">
        <div
          v-for="cat in allCategories"
          :key="cat.id"
          class="category-tab"
          :class="{ active: selectedCategory === cat.id }"
          @click="onCategoryChange(cat.id)"
        >
          <span class="tab-icon">{{ cat.icon }}</span>
          <span class="tab-name">{{ cat.name }}</span>
          <span class="tab-count" v-if="categoryCountMap[cat.id] > 0">
            {{ categoryCountMap[cat.id] }}
          </span>
        </div>
      </div>

      <div class="stockpile-body" v-if="items.length">
        <van-swipe-cell v-for="item in items" :key="item.id">
          <div class="stockpile-item">
            <van-checkbox
              :model-value="stockpileStore.isSelected(item.id)"
              @update:model-value="onToggleSelect(item.id)"
              class="stockpile-item__checkbox"
            />
            <img v-lazy="item.product.images[0]" class="stockpile-item__image" />
            <div class="stockpile-item__info">
              <div class="stockpile-item__header">
                <span class="stockpile-item__name">{{ item.product.name }}</span>
                <span class="stockpile-item__category" @click="openCategoryPicker(item)">
                  {{ getCategoryInfo(item.category).icon }}
                </span>
              </div>
              <div class="stockpile-item__spec" v-if="Object.keys(item.specValues).length">
                {{ specText(item.specValues) }}
              </div>
              <div class="stockpile-item__meta">
                <span class="meta-item">
                  <van-icon name="clock-o" size="11" />
                  上次购买: {{ formatDate(item.lastPurchasedAt) }}
                </span>
                <span class="meta-item">
                  <van-icon name="description" size="11" />
                  已购 {{ item.purchaseCount }} 次
                </span>
              </div>
              <div class="stockpile-item__note" v-if="item.note" @click="openNotePopup(item)">
                <van-icon name="edit" size="11" />
                {{ item.note }}
              </div>
              <div class="stockpile-item__note stockpile-item__note--empty" v-else @click="openNotePopup(item)">
                <van-icon name="plus" size="11" />
                添加备注
              </div>
              <div class="stockpile-item__bottom">
                <span class="stockpile-item__price">¥{{ formatPrice(item.product.price) }}</span>
                <van-stepper
                  :model-value="item.quantity"
                  @update:model-value="(val: number) => onQuantityChange(item.id, val)"
                  min="1"
                  max="99"
                  class="stockpile-item__stepper"
                />
              </div>
            </div>
          </div>
          <template #right>
            <van-button type="danger" class="delete-btn" @click="onDelete(item.id, item.product.name)">删除</van-button>
          </template>
        </van-swipe-cell>
      </div>

      <EmptyState
        v-else
        :image="'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=empty%20storage%20box%20illustration%20minimal%20flat%20design%20warm%20orange%20tones&image_size=square'"
        description="囤货清单空空如也"
      >
        <van-button type="primary" size="small" @click="goShopping">去添加商品</van-button>
      </EmptyState>
    </div>

    <div class="stockpile-bottom" v-if="items.length">
      <van-checkbox
        :model-value="isAllSelected"
        @update:model-value="onToggleSelectAll"
        class="stockpile-bottom__select-all"
      >
        全选
      </van-checkbox>
      <div class="stockpile-bottom__amount">
        合计: <span class="stockpile-bottom__price">¥{{ formatPrice(totalAmount) }}</span>
      </div>
      <div class="stockpile-bottom__actions">
        <van-button
          type="default"
          class="btn-add-all"
          :disabled="totalCount === 0"
          @click="onAddAllToCart"
        >
          全部加购
        </van-button>
        <van-button
          type="primary"
          class="btn-add-selected"
          :disabled="selectedCount === 0"
          @click="onAddSelectedToCart"
        >
          加入购物车({{ selectedCount }})
        </van-button>
      </div>
    </div>

    <Popup v-model:show="showNotePopup" position="bottom" :style="{ height: '50%' }">
      <div class="note-popup">
        <div class="note-popup__header">
          <span class="note-popup__title">添加备注</span>
          <van-icon name="cross" size="20" @click="showNotePopup = false" />
        </div>
        <div class="note-popup__content">
          <van-field
            v-model="noteText"
            type="textarea"
            placeholder="写下你需要的备注，比如购买频率、用途等..."
            :autosize="{ maxHeight: 120 }"
            maxlength="50"
            show-word-limit
          />
        </div>
        <div class="note-popup__footer">
          <van-button type="primary" block @click="saveNote">保存</van-button>
        </div>
      </div>
    </Popup>

    <Popup v-model:show="showCategoryPicker" position="bottom">
      <div class="category-popup">
        <div class="category-popup__header">
          <span class="category-popup__title">选择分类</span>
          <van-icon name="cross" size="20" @click="showCategoryPicker = false" />
        </div>
        <van-picker
          :columns="categoryColumns"
          @confirm="onConfirmCategory"
          @cancel="showCategoryPicker = false"
        />
      </div>
    </Popup>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.stockpile-page {
  min-height: 100vh;
  background: $bg;
  padding-top: 46px;
  padding-bottom: 80px;
}

.stockpile-content {
  padding-top: 44px;
}

.category-tabs {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  z-index: 99;
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: $bg;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: $bg-card;
  border-radius: 16px;
  font-size: 12px;
  color: $text-secondary;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &.active {
    background: linear-gradient(135deg, $primary, $primary-dark);
    color: #fff;
    font-weight: 500;
  }

  .tab-icon {
    font-size: 14px;
  }

  .tab-count {
    background: rgba(255, 255, 255, 0.3);
    color: #fff;
    padding: 0 6px;
    border-radius: 8px;
    font-size: 10px;
  }

  &:not(.active) .tab-count {
    background: rgba(0, 0, 0, 0.1);
    color: $text-secondary;
  }
}

.stockpile-body {
  padding: 12px;
}

.stockpile-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: $bg-card;
  border-radius: $radius-md;
  margin-bottom: 8px;
  gap: 10px;

  &__checkbox {
    flex-shrink: 0;
    margin-top: 30px;
  }

  &__image {
    width: 80px;
    height: 80px;
    border-radius: $radius-sm;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__name {
    font-size: 14px;
    color: $text-primary;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  &__category {
    flex-shrink: 0;
    font-size: 16px;
    padding: 2px 6px;
    background: $bg;
    border-radius: 8px;
  }

  &__spec {
    font-size: 12px;
    color: $text-secondary;
  }

  &__meta {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: $text-secondary;
    margin-top: 2px;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  &__note {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $primary;
    background: rgba(45, 184, 123, 0.1);
    padding: 4px 8px;
    border-radius: 6px;
    margin-top: 2px;
    width: fit-content;

    &--empty {
      color: $text-secondary;
      background: $bg;
    }
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
  }

  &__price {
    font-size: 15px;
    color: $danger;
    font-weight: 600;
  }

  &__stepper {
    :deep(.van-stepper__input) {
      width: 32px;
    }
  }
}

.delete-btn {
  height: 100% !important;
}

.stockpile-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 60px;
  background: $bg-card;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
  flex-wrap: wrap;
  gap: 8px;

  &__select-all {
    flex-shrink: 0;
  }

  &__amount {
    flex: 1;
    text-align: right;
    padding-right: 12px;
    font-size: 13px;
    color: $text-primary;
    min-width: 100px;
  }

  &__price {
    color: $danger;
    font-weight: 600;
    font-size: 16px;
  }

  &__actions {
    display: flex;
    gap: 8px;
    width: 100%;
    padding-top: 4px;
    border-top: 1px solid $border;
  }

  .btn-add-all {
    flex: 1;
    border-radius: 20px;
    height: 36px;
    font-size: 13px;
    font-weight: 500;
  }

  .btn-add-selected {
    flex: 1;
    border-radius: 20px;
    height: 36px;
    font-size: 13px;
    font-weight: 500;
    background: linear-gradient(135deg, $primary, $primary-dark);
    border: none;

    &:not(:disabled):active {
      transform: scale(0.95);
    }
  }
}

.note-popup {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid $border;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  &__content {
    flex: 1;
    padding: 16px;
  }

  &__footer {
    padding: 16px;
    border-top: 1px solid $border;
  }
}

.category-popup {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid $border;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }
}
</style>
