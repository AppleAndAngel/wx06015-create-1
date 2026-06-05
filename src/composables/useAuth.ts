import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

export function useAuth() {
  const userStore = useUserStore()
  const router = useRouter()

  function checkAuth(): boolean {
    return userStore.isLoggedIn
  }

  function requireAuth(): boolean {
    if (!userStore.isLoggedIn) {
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath },
      })
      return false
    }
    return true
  }

  return {
    checkAuth,
    requireAuth,
  }
}
