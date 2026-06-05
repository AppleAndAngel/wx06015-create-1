import type { Category } from '@/types'

export const mockCategories: Category[] = [
  {
    id: 1,
    name: '水果',
    icon: '🍎',
    children: [
      { id: 11, name: '热带水果', icon: '🥭' },
      { id: 12, name: '浆果类', icon: '🫐' },
      { id: 13, name: '柑橘类', icon: '🍊' },
    ],
  },
  {
    id: 2,
    name: '肉禽蛋',
    icon: '�',
    children: [
      { id: 21, name: '猪肉', icon: '🐷' },
      { id: 22, name: '牛肉', icon: '🐄' },
      { id: 23, name: '鸡肉', icon: '🐔' },
    ],
  },
  {
    id: 3,
    name: '蛋奶',
    icon: '�',
    children: [
      { id: 31, name: '鸡蛋', icon: '🥚' },
      { id: 32, name: '牛奶', icon: '🥛' },
    ],
  },
  {
    id: 4,
    name: '海鲜水产',
    icon: '🐟',
    children: [
      { id: 41, name: '鱼类', icon: '🐟' },
      { id: 42, name: '虾蟹', icon: '🦐' },
      { id: 43, name: '贝类', icon: '🐚' },
    ],
  },
  {
    id: 5,
    name: '蔬菜',
    icon: '�',
    children: [
      { id: 51, name: '叶菜类', icon: '🥬' },
      { id: 52, name: '根茎类', icon: '🥕' },
      { id: 53, name: '菌菇类', icon: '🍄' },
    ],
  },
  {
    id: 6,
    name: '豆制品',
    icon: '🧈',
  },
  {
    id: 7,
    name: '粮油调味',
    icon: '🍚',
  },
  {
    id: 8,
    name: '烘焙甜品',
    icon: '🍰',
  },
]

export function getMockCategories() {
  return mockCategories
}
