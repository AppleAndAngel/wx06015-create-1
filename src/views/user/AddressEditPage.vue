<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Field, Switch, Button, Area, showToast, Popup } from 'vant'
import AppHeader from '@/components/AppHeader.vue'
import { useAddressStore } from '@/stores/address'
import type { Address } from '@/types'
import { areaList } from '@vant/area-data'

const route = useRoute()
const router = useRouter()
const addressStore = useAddressStore()

const editId = computed(() => route.params.id ? Number(route.params.id) : 0)
const isEdit = computed(() => editId.value > 0)

const name = ref('')
const phone = ref('')
const areaCode = ref('')
const detail = ref('')
const isDefault = ref(false)
const showArea = ref(false)

const areaText = computed(() => {
  if (!areaCode.value) return ''
  const province = areaList.province_list[areaCode.value.slice(0, 2) + '0000'] || ''
  const city = areaList.city_list[areaCode.value.slice(0, 4) + '00'] || ''
  const district = areaList.county_list[areaCode.value] || ''
  return `${province} ${city} ${district}`.trim()
})

const onAreaConfirm = ({ selectedOptions }: any) => {
  areaCode.value = selectedOptions[selectedOptions.length - 1]?.value || ''
  showArea.value = false
}

const onSave = async () => {
  if (!name.value.trim()) {
    showToast('请输入姓名')
    return
  }
  if (!/^1\d{10}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  if (!areaCode.value) {
    showToast('请选择地区')
    return
  }
  if (!detail.value.trim()) {
    showToast('请输入详细地址')
    return
  }

  const province = areaList.province_list[areaCode.value.slice(0, 2) + '0000'] || ''
  const city = areaList.city_list[areaCode.value.slice(0, 4) + '00'] || ''
  const district = areaList.county_list[areaCode.value] || ''

  const addressData: Omit<Address, 'id'> = {
    name: name.value.trim(),
    phone: phone.value.trim(),
    province,
    city,
    district,
    detail: detail.value.trim(),
    isDefault: isDefault.value,
  }

  if (isEdit.value) {
    await addressStore.updateAddress({ id: editId.value, ...addressData })
    showToast('保存成功')
  } else {
    await addressStore.addAddress(addressData)
    showToast('添加成功')
  }
  router.back()
}

onMounted(async () => {
  if (isEdit.value) {
    await addressStore.fetchAddresses()
    const addr = addressStore.addresses.find((a) => a.id === editId.value)
    if (addr) {
      name.value = addr.name
      phone.value = addr.phone
      detail.value = addr.detail
      isDefault.value = addr.isDefault
    }
  }
})
</script>

<template>
  <div class="address-edit-page">
    <AppHeader :title="isEdit ? '编辑地址' : '新增地址'" show-back @click-left="router.back()" />

    <div class="address-edit-page__content">
      <div class="form-section">
        <van-field
          v-model="name"
          label="姓名"
          placeholder="请输入收货人姓名"
          maxlength="20"
          required
        />
        <van-field
          v-model="phone"
          label="手机号"
          type="tel"
          placeholder="请输入手机号"
          maxlength="11"
          required
        />
        <van-field
          :model-value="areaText"
          label="地区"
          placeholder="请选择省/市/区"
          readonly
          is-link
          required
          @click="showArea = true"
        />
        <van-field
          v-model="detail"
          label="详细地址"
          type="textarea"
          placeholder="请输入详细地址，如街道、楼牌号等"
          rows="3"
          maxlength="200"
          show-word-limit
          required
        />
      </div>

      <div class="default-section">
        <span class="default-section__label">设为默认地址</span>
        <van-switch v-model="isDefault" size="22px" />
      </div>

      <van-button type="primary" block round class="save-btn" @click="onSave">
        保存
      </van-button>
    </div>

    <van-popup v-model:show="showArea" round position="bottom">
      <van-area
        :area-list="areaList"
        :columns-placeholder="['请选择', '请选择', '请选择']"
        @confirm="onAreaConfirm"
        @cancel="showArea = false"
      />
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.address-edit-page {
  min-height: 100vh;
  background: $bg;

  &__content {
    padding-top: 46px;
    padding: 56px 16px 16px;
  }
}

.form-section {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow;
  overflow: hidden;

  :deep(.van-field__label) {
    width: 70px;
    color: $text-primary;
  }

  :deep(.van-cell) {
    padding: 14px 16px;
  }

  :deep(.van-cell::after) {
    left: 16px;
    right: 16px;
  }
}

.default-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow;
  padding: 14px 16px;
  margin-top: 12px;

  &__label {
    font-size: 15px;
    color: $text-primary;
  }
}

.save-btn {
  margin-top: 24px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}
</style>
