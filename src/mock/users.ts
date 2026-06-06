import type { User, Address } from '@/types'

const img = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`

export const defaultUser: User = {
  id: 1,
  phone: '138****8888',
  nickname: '鲜集用户',
  avatar: img('happy young Chinese person avatar, modern style, clean background'),
  token: 'mock_jwt_token_xianji_2026',
  isNewUser: true,
  hasClaimedNewUserCoupon: false
}

export const addresses: Address[] = [
  {
    id: 1,
    name: '张小明',
    phone: '13800008888',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '望京SOHO T3 1206室',
    isDefault: true
  },
  {
    id: 2,
    name: '张小明',
    phone: '13800008888',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '陆家嘴环路1000号 恒生银行大厦 8楼',
    isDefault: false
  },
  {
    id: 3,
    name: '李小红',
    phone: '13900009999',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南路深圳湾创新科技中心 3栋 1502',
    isDefault: false
  }
]
