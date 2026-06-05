<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  endTime: string | number
}>()

const emit = defineEmits<{
  finish: []
}>()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const diff = computed(() => {
  const target = typeof props.endTime === 'string' ? new Date(props.endTime).getTime() : props.endTime
  return Math.max(0, target - now.value)
})

const hours = computed(() => String(Math.floor(diff.value / 3600000)).padStart(2, '0'))
const minutes = computed(() => String(Math.floor((diff.value % 3600000) / 60000)).padStart(2, '0'))
const seconds = computed(() => String(Math.floor((diff.value % 60000) / 1000)).padStart(2, '0'))

const digits = (val: string) => val.split('')

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
    if (diff.value <= 0) {
      if (timer) clearInterval(timer)
      emit('finish')
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="countdown">
    <div class="countdown__group">
      <span v-for="(d, i) in digits(hours)" :key="'h' + i" class="countdown__digit">{{ d }}</span>
      <span class="countdown__sep">:</span>
    </div>
    <div class="countdown__group">
      <span v-for="(d, i) in digits(minutes)" :key="'m' + i" class="countdown__digit">{{ d }}</span>
      <span class="countdown__sep">:</span>
    </div>
    <div class="countdown__group">
      <span v-for="(d, i) in digits(seconds)" :key="'s' + i" class="countdown__digit">{{ d }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.countdown {
  display: inline-flex;
  align-items: center;
  gap: 2px;

  &__group {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  &__digit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 34px;
    background: $text-primary;
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    font-variant-numeric: tabular-nums;
  }

  &__sep {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
    margin: 0 2px;
  }
}
</style>
