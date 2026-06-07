export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/category/index',
    'pages/compare/index',
    'pages/cart/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/search/index',
    'pages/order/index',
    'pages/favorite/index',
    'pages/arrival/index',
    'pages/combo/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#22C55E',
    navigationBarTitleText: '鲜果对比',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F8FAFC'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#22C55E',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/category/index',
        text: '分类'
      },
      {
        pagePath: 'pages/compare/index',
        text: '对比'
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  },
  style: 'v2',
  sitemapLocation: 'sitemap.json'
})
