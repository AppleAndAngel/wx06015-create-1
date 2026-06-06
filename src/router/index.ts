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
import GroupBuyListPage from '@/views/group-buy/ListPage.vue'
import GroupBuyDetailPage from '@/views/group-buy/DetailPage.vue'
import GroupDetailPage from '@/views/group-buy/GroupDetailPage.vue'
import MyGroupsPage from '@/views/group-buy/MyGroupsPage.vue'
import PresaleIndexPage from '@/views/presale/IndexPage.vue'
import MyReservationsPage from '@/views/presale/MyReservationsPage.vue'
import GiftCardListPage from '@/views/gift-card/ListPage.vue'
import GiftCardPurchasePage from '@/views/gift-card/PurchasePage.vue'
import GiftCardDetailPage from '@/views/gift-card/DetailPage.vue'
import MyGiftCardsPage from '@/views/gift-card/MyCardsPage.vue'
import GroupMealListPage from '@/views/group-meal/ListPage.vue'
import GroupMealCheckoutPage from '@/views/group-meal/CheckoutPage.vue'
import GroupMealOrderDetailPage from '@/views/group-meal/OrderDetailPage.vue'
import GroupMealMyOrdersPage from '@/views/group-meal/MyOrdersPage.vue'

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
    {
      path: '/group-buy',
      component: GroupBuyListPage,
    },
    {
      path: '/group-buy/:id',
      component: GroupBuyDetailPage,
    },
    {
      path: '/group-detail/:id',
      component: GroupDetailPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-groups',
      component: MyGroupsPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/presale',
      component: PresaleIndexPage,
    },
    {
      path: '/presale/my',
      component: MyReservationsPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/gift-card',
      component: GiftCardListPage,
    },
    {
      path: '/gift-card/purchase/:denominationId',
      component: GiftCardPurchasePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/gift-card/:id',
      component: GiftCardDetailPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-gift-cards',
      component: MyGiftCardsPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/group-meal',
      component: GroupMealListPage,
    },
    {
      path: '/group-meal/checkout',
      component: GroupMealCheckoutPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/group-meal/order/:id',
      component: GroupMealOrderDetailPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-group-meals',
      component: GroupMealMyOrdersPage,
      meta: { requiresAuth: true },
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
