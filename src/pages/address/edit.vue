<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { View, Text, Input, Textarea, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useAddressStore } from '@/stores/address'
import styles from './edit.module.scss'

const router = useRouter()
const addressStore = useAddressStore()

const editId = ref<string | null>(null)
const isEdit = computed(() => !!editId.value)

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  tag: '',
  isDefault: false
})

const presetTags = ['家人', '朋友', '同事', '自己', '妈妈', '爸爸', '老师', '其他']

onMounted(() => {
  const id = router.params.id
  if (id) {
    editId.value = id
    const address = addressStore.addressList.find(addr => addr.id === id)
    if (address) {
      form.name = address.name
      form.phone = address.phone
      form.province = address.province
      form.city = address.city
      form.district = address.district
      form.detail = address.detail
      form.tag = address.tag
      form.isDefault = address.isDefault
    }
  }
})

const regionText = computed(() => {
  if (form.province && form.city && form.district) {
    return `${form.province} ${form.city} ${form.district}`
  }
  return ''
})

const canSave = computed(() => {
  return form.name.trim() && 
         form.phone.trim() && 
         form.province && 
         form.city && 
         form.district && 
         form.detail.trim()
})

const handleRegionClick = () => {
  Taro.chooseLocation?.({
    success: () => {},
    fail: () => {
      Taro.showActionSheet({
        itemList: ['北京市 北京市 朝阳区', '上海市 上海市 浦东新区', '广东省 广州市 天河区', '广东省 深圳市 南山区'],
        success: (res) => {
          const regions = [
            ['北京市', '北京市', '朝阳区'],
            ['上海市', '上海市', '浦东新区'],
            ['广东省', '广州市', '天河区'],
            ['广东省', '深圳市', '南山区']
          ]
          const [province, city, district] = regions[res.tapIndex]
          form.province = province
          form.city = city
          form.district = district
        }
      })
    }
  })
}

const handleTagClick = (tag: string) => {
  form.tag = form.tag === tag ? '' : tag
}

const handleToggleDefault = () => {
  form.isDefault = !form.isDefault
}

const handleSave = () => {
  if (!canSave.value) {
    Taro.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(form.phone.replace(/\*/g, '0')) && form.phone.includes('*')) {
  } else if (!phoneRegex.test(form.phone)) {
    Taro.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }

  const addressData = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    province: form.province,
    city: form.city,
    district: form.district,
    detail: form.detail.trim(),
    tag: form.tag,
    isDefault: form.isDefault
  }

  if (isEdit.value && editId.value) {
    addressStore.updateAddress(editId.value, addressData)
  } else {
    addressStore.addAddress(addressData)
  }

  setTimeout(() => {
    Taro.navigateBack()
  }, 500)
}

const handleDelete = () => {
  if (!editId.value) return

  Taro.showModal({
    title: '确认删除',
    content: '确定要删除这个地址吗？',
    confirmColor: '#EF4444',
    success: (res) => {
      if (res.confirm) {
        addressStore.deleteAddress(editId.value!)
        setTimeout(() => {
          Taro.navigateBack()
        }, 300)
      }
    }
  })
}
</script>

<template>
  <view :class="styles.container">
    <scroll-view :class="styles.content" scroll-y>
      <view :class="styles.form">
        <view :class="styles.formItem">
          <text :class="styles.label">收货人</text>
          <view :class="styles.inputWrapper">
            <input
              :class="styles.input"
              v-model="form.name"
              placeholder="请输入收货人姓名"
              placeholder-class="placeholder"
              maxlength="20"
            />
          </view>
        </view>

        <view :class="styles.formItem">
          <text :class="styles.label">手机号码</text>
          <view :class="styles.inputWrapper">
            <input
              :class="styles.input"
              v-model="form.phone"
              placeholder="请输入手机号码"
              placeholder-class="placeholder"
              type="number"
              maxlength="11"
            />
          </view>
        </view>

        <view :class="styles.formItem" @click="handleRegionClick">
          <text :class="styles.label">所在地区</text>
          <view :class="styles.inputWrapper">
            <view :class="[styles.regionPicker, !regionText && styles.placeholder]">
              {{ regionText || '请选择省市区' }}
            </view>
          </view>
        </view>

        <view :class="styles.formItem">
          <text :class="styles.label">详细地址</text>
          <view :class="styles.inputWrapper">
            <textarea
              :class="styles.textarea"
              v-model="form.detail"
              placeholder="请输入详细地址，如街道、门牌号等"
              placeholder-class="placeholder"
              maxlength="100"
              :auto-height="true"
            />
          </view>
        </view>
      </view>

      <view :class="styles.tagSection">
        <text :class="styles.tagTitle">地址标签</text>
        <view :class="styles.tagList">
          <view
            v-for="tag in presetTags"
            :key="tag"
            :class="[styles.tagItem, form.tag === tag && styles.active]"
            @click="handleTagClick(tag)"
          >
            {{ tag }}
          </view>
        </view>
      </view>

      <view :class="styles.defaultSection" @click="handleToggleDefault">
        <view>
          <text :class="styles.defaultLabel">设为默认地址</text>
          <text :class="styles.defaultDesc">结算时将优先使用此地址</text>
        </view>
        <view :class="[styles.switch, form.isDefault && styles.active]">
          <view :class="styles.switchKnob"></view>
        </view>
      </view>
    </scroll-view>

    <view :class="styles.footer">
      <view v-if="isEdit" :class="styles.footerBtns">
        <button :class="styles.deleteBtn" @click="handleDelete">删除</button>
        <button :class="styles.saveBtn" :disabled="!canSave" @click="handleSave">保存</button>
      </view>
      <button v-else :class="styles.saveBtn" :disabled="!canSave" @click="handleSave">保存地址</button>
    </view>
  </view>
</template>
