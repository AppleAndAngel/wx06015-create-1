<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Field, Button, showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const startCountdown = () => {
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer!)
      timer = null
    }
  }, 1000)
}

const onGetCode = () => {
  if (!/^1\d{10}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  startCountdown()
  showToast('验证码已发送')
}

const onLogin = async () => {
  if (!/^1\d{10}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  if (code.value !== '123456') {
    showToast('验证码错误')
    return
  }
  try {
    await userStore.login(phone.value, code.value)
    showToast({ message: '登录成功', type: 'success' })
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch {
    showToast('登录失败')
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-page__header">
      <h1 class="login-page__logo">鲜集</h1>
      <p class="login-page__slogan">新鲜好物 集中送达</p>
    </div>
    <div class="login-page__card">
      <div class="login-page__form">
        <div class="phone-field">
          <span class="phone-field__prefix">+86</span>
          <van-field
            v-model="phone"
            type="tel"
            maxlength="11"
            placeholder="请输入手机号"
            class="phone-field__input"
          />
        </div>
        <div class="code-field">
          <van-field
            v-model="code"
            type="digit"
            maxlength="6"
            placeholder="请输入验证码"
            class="code-field__input"
          />
          <van-button
            :disabled="countdown > 0"
            size="small"
            type="primary"
            class="code-field__btn"
            @click="onGetCode"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </van-button>
        </div>
        <van-button
          type="primary"
          block
          round
          class="login-page__submit"
          @click="onLogin"
        >
          登录/注册
        </van-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.login-page {
  min-height: 100vh;
  position: relative;
  background: $bg;

  &__header {
    height: 280px;
    background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 40px;
  }

  &__logo {
    font-family: $font-display;
    font-size: 48px;
    color: #fff;
    margin-bottom: 8px;
  }

  &__slogan {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 2px;
  }

  &__card {
    position: relative;
    margin-top: -60px;
    background: $bg-card;
    border-radius: $radius-xl $radius-xl 0 0;
    padding: 40px 24px 32px;
    min-height: calc(100vh - 220px);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__submit {
    margin-top: 12px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
  }
}

.phone-field {
  display: flex;
  align-items: center;
  border: 1px solid $border;
  border-radius: $radius-md;
  padding: 0 12px;
  background: $bg-card;

  &__prefix {
    font-size: 15px;
    color: $text-primary;
    font-weight: 500;
    padding-right: 10px;
    border-right: 1px solid $border;
    margin-right: 10px;
    white-space: nowrap;
  }

  &__input {
    flex: 1;
    background: transparent;

    :deep(.van-field__control) {
      font-size: 15px;
    }

    :deep(.van-field__body) {
      padding: 0;
    }
  }
}

.code-field {
  display: flex;
  align-items: center;
  gap: 12px;

  &__input {
    flex: 1;
    border: 1px solid $border;
    border-radius: $radius-md;
    background: $bg-card;

    :deep(.van-field__control) {
      font-size: 15px;
    }
  }

  &__btn {
    flex-shrink: 0;
    white-space: nowrap;
    border-radius: $radius-md;
  }
}
</style>
