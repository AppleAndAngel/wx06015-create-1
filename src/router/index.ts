import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/home/IndexPage.vue'
import CategoryPage from '@/views/category/IndexPage.vue'
import ProductDetail from '@/views/product/DetailPage.vue'
import CartPage from '@/views/cart/IndexPage.vue'
import CheckoutPage from '@/views/checkout/IndexPage.vue'
import PaymentPage from '@/views/payment/PaymentPage.vue'
import UserCenter from '@/views/user/CenterPage.vue'
import OrderListPage from '@/views/user/OrderListPage.vue'
import OrderDetailPage from '@/views/user/OrderDetailPage.vue'
import AddressListPage from '@/views/user/AddressListPage.vue'
import AddressEditPage from '@/views/user/AddressEditPage.vue'
import LoginPage from '@/views/login/LoginPage.vue'
import SearchPage from '@/views/search/SearchPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/category',
      component: CategoryPage,
    },
    {
      path: '/product/:id',
      component: ProductDetail,
    },
    {
      path: '/cart',
      component: CartPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/checkout',
      component: CheckoutPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/payment/:orderId',
      component: PaymentPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/user',
      component: UserCenter,
      meta: { requiresAuth: true },
    },
    {
      path: '/user/orders',
      component: OrderListPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/user/orders/:id',
      component: OrderDetailPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/user/address',
      component: AddressListPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/user/address/edit/:id?',
      component: AddressEditPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      component: LoginPage,
    },
    {
      path: '/search',
      component: SearchPage,
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }
})

export default router
