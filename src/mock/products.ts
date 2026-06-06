import type { Product, Coupon, NewUserZoneData } from '@/types'

const img = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`

export const products: Product[] = [
  {
    id: 1,
    name: '山东红富士苹果',
    subtitle: '脆甜多汁 产地直发',
    price: 12.8,
    originalPrice: 18.9,
    images: [
      img('fresh red Fuji apple on tree, close-up, bright sunlight, farm background'),
      img('basket of red Fuji apples, clean white background, product photo'),
      img('sliced red Fuji apple showing juicy interior, food photography')
    ],
    categoryId: 1,
    specs: [
      { name: '规格', values: ['5斤装', '10斤装'] },
      { name: '产地', values: ['山东烟台', '陕西洛川'] }
    ],
    sales: 3856,
    rating: 4.8,
    tags: ['产地直发', '当季热卖'],
    reviews: [
      {
        id: 1,
        username: '小果子',
        avatar: img('happy young woman avatar, cartoon style'),
        content: '非常新鲜，脆甜可口，家人都很喜欢！',
        rating: 5,
        images: [img('fresh apples in kitchen, home photo')],
        createdAt: '2026-05-20'
      },
      {
        id: 2,
        username: '吃货小王',
        avatar: img('smiling man avatar, cartoon style'),
        content: '个头很大，水分足，回购了',
        rating: 4,
        images: [],
        createdAt: '2026-05-18'
      },
      {
        id: 3,
        username: '美食达人',
        avatar: img('young woman food lover avatar, cartoon style'),
        content: '味道很正，比超市的好吃多了',
        rating: 5,
        images: [img('apples on table with water drops, food photo')],
        createdAt: '2026-05-15'
      }
    ]
  },
  {
    id: 2,
    name: '海南金煌芒果',
    subtitle: '果肉细腻 甜度爆表',
    price: 29.9,
    originalPrice: 39.9,
    images: [
      img('golden ripe mango on tree, tropical farm, sunlight'),
      img('box of golden mangoes, fresh fruit product photo'),
      img('cut golden mango showing flesh, tropical food photography')
    ],
    categoryId: 1,
    specs: [
      { name: '规格', values: ['5斤装', '10斤装'] },
      { name: '品种', values: ['金煌芒', '贵妃芒'] }
    ],
    sales: 2210,
    rating: 4.9,
    tags: ['有机', '产地直发'],
    reviews: [
      {
        id: 4,
        username: '芒果控',
        avatar: img('young woman with mango avatar, cartoon'),
        content: '芒果又大又甜，果肉非常细腻！',
        rating: 5,
        images: [img('golden mango slices on plate, food photo')],
        createdAt: '2026-05-22'
      },
      {
        id: 5,
        username: '水果迷',
        avatar: img('cute girl avatar, cartoon style'),
        content: '甜度真的爆表，强烈推荐',
        rating: 5,
        images: [],
        createdAt: '2026-05-19'
      }
    ]
  },
  {
    id: 3,
    name: '云南蓝莓',
    subtitle: '颗颗饱满 花青素满满',
    price: 35.8,
    originalPrice: 49.9,
    images: [
      img('fresh blueberries on bush, close-up, morning dew'),
      img('bowl of fresh blueberries, white background, product photo'),
      img('handful of blueberries, food photography, vibrant color')
    ],
    categoryId: 1,
    specs: [
      { name: '规格', values: ['125g', '250g', '500g'] },
      { name: '等级', values: ['特大果', '大果'] }
    ],
    sales: 1560,
    rating: 4.7,
    tags: ['有机', '当季热卖'],
    reviews: [
      {
        id: 6,
        username: '健康生活',
        avatar: img('fitness woman avatar, cartoon style'),
        content: '蓝莓很新鲜，个头也大，花青素满满',
        rating: 5,
        images: [],
        createdAt: '2026-05-21'
      },
      {
        id: 7,
        username: '宝妈日记',
        avatar: img('mother avatar, cartoon style'),
        content: '孩子很喜欢吃，每天一盒当零食',
        rating: 4,
        images: [img('blueberries in small box, children snack')],
        createdAt: '2026-05-17'
      }
    ]
  },
  {
    id: 4,
    name: '有机小番茄',
    subtitle: '皮薄汁多 酸甜可口',
    price: 15.8,
    originalPrice: 22.0,
    images: [
      img('cherry tomatoes on vine, greenhouse, organic farm'),
      img('bowl of red cherry tomatoes, fresh product photo'),
      img('handful of cherry tomatoes, bright red, food photography')
    ],
    categoryId: 2,
    specs: [
      { name: '规格', values: ['1斤装', '3斤装'] },
      { name: '品种', values: ['千禧果', '圣女果'] }
    ],
    sales: 4120,
    rating: 4.8,
    tags: ['有机', '产地直发'],
    reviews: [
      {
        id: 8,
        username: '素食主义',
        avatar: img('vegetarian woman avatar, cartoon'),
        content: '真的皮薄汁多，比外面买的好太多',
        rating: 5,
        images: [img('cherry tomatoes in hand, fresh')],
        createdAt: '2026-05-23'
      },
      {
        id: 9,
        username: '老饕',
        avatar: img('man chef avatar, cartoon style'),
        content: '酸甜比例刚刚好，拌沙拉绝了',
        rating: 4,
        images: [],
        createdAt: '2026-05-20'
      }
    ]
  },
  {
    id: 5,
    name: '山东寿光黄瓜',
    subtitle: '顶花带刺 清脆爽口',
    price: 6.9,
    originalPrice: 9.9,
    images: [
      img('fresh green cucumber on vine, farm, morning light'),
      img('bundle of fresh cucumbers, white background, product photo'),
      img('sliced cucumber, crisp texture, food photography')
    ],
    categoryId: 2,
    specs: [
      { name: '规格', values: ['2斤装', '5斤装'] },
      { name: '产地', values: ['山东寿光', '河北固安'] }
    ],
    sales: 5670,
    rating: 4.6,
    tags: ['产地直发', '当季热卖'],
    reviews: [
      {
        id: 10,
        username: '减肥达人',
        avatar: img('fitness girl avatar, cartoon'),
        content: '非常新鲜，生吃就很好吃',
        rating: 5,
        images: [],
        createdAt: '2026-05-22'
      },
      {
        id: 11,
        username: '厨房小白',
        avatar: img('young man cooking avatar, cartoon'),
        content: '黄瓜很嫩，凉拌超好吃',
        rating: 4,
        images: [img('cucumber salad on plate, Chinese dish')],
        createdAt: '2026-05-18'
      }
    ]
  },
  {
    id: 6,
    name: '云南高原西兰花',
    subtitle: '花球紧密 营养丰富',
    price: 8.5,
    originalPrice: 12.0,
    images: [
      img('fresh broccoli in field, green vegetable, farm'),
      img('single broccoli head, white background, product photo'),
      img('steamed broccoli on plate, healthy food photography')
    ],
    categoryId: 2,
    specs: [
      { name: '规格', values: ['1颗', '3颗装'] },
      { name: '品种', values: ['绿冠', '优秀'] }
    ],
    sales: 2340,
    rating: 4.5,
    tags: ['有机', '产地直发'],
    reviews: [
      {
        id: 12,
        username: '养生达人',
        avatar: img('healthy lifestyle woman avatar, cartoon'),
        content: '西兰花很新鲜，花球紧密，焯水后特别绿',
        rating: 5,
        images: [],
        createdAt: '2026-05-21'
      },
      {
        id: 13,
        username: '健身小哥',
        avatar: img('muscular man avatar, cartoon'),
        content: '减脂期必备，质量不错',
        rating: 4,
        images: [img('broccoli and chicken breast meal prep')],
        createdAt: '2026-05-19'
      }
    ]
  },
  {
    id: 7,
    name: '内蒙古草原羊排',
    subtitle: '鲜嫩多汁 膻味小',
    price: 68.0,
    originalPrice: 89.0,
    images: [
      img('fresh lamb ribs on cutting board, butcher display'),
      img('raw lamb rack, premium meat, white background product photo'),
      img('grilled lamb ribs, roasted golden, food photography')
    ],
    categoryId: 3,
    specs: [
      { name: '规格', values: ['500g', '1kg'] },
      { name: '部位', values: ['羊排', '羊腿'] }
    ],
    sales: 1890,
    rating: 4.9,
    tags: ['产地直发', '当季热卖'],
    reviews: [
      {
        id: 14,
        username: '烤肉大师',
        avatar: img('bbq chef man avatar, cartoon'),
        content: '羊肉品质一流，膻味很小，烤着吃绝了',
        rating: 5,
        images: [img('grilled lamb ribs on grill, BBQ photo')],
        createdAt: '2026-05-23'
      },
      {
        id: 15,
        username: '家庭煮夫',
        avatar: img('man cooking avatar, cartoon'),
        content: '炖萝卜很好吃，肉质很嫩',
        rating: 5,
        images: [],
        createdAt: '2026-05-20'
      }
    ]
  },
  {
    id: 8,
    name: '正大土鸡蛋',
    subtitle: '散养土鸡 蛋黄饱满',
    price: 25.9,
    originalPrice: 32.0,
    images: [
      img('farm fresh eggs in basket, countryside, morning light'),
      img('box of eggs, product photo, white background'),
      img('cracked egg showing golden yolk, food photography')
    ],
    categoryId: 3,
    specs: [
      { name: '规格', values: ['20枚装', '30枚装', '40枚装'] },
      { name: '品种', values: ['土鸡蛋', '乌骨鸡蛋'] }
    ],
    sales: 7820,
    rating: 4.7,
    tags: ['有机', '产地直发'],
    reviews: [
      {
        id: 16,
        username: '宝妈日记',
        avatar: img('mother avatar, cartoon style'),
        content: '蛋黄颜色很深，孩子说比普通鸡蛋好吃',
        rating: 5,
        images: [img('boiled eggs with golden yolk, breakfast')],
        createdAt: '2026-05-22'
      },
      {
        id: 17,
        username: '营养专家',
        avatar: img('doctor woman avatar, cartoon'),
        content: '蛋壳厚实，蛋黄饱满，品质不错',
        rating: 4,
        images: [],
        createdAt: '2026-05-19'
      }
    ]
  },
  {
    id: 9,
    name: '黑猪五花肉',
    subtitle: '肥瘦相间 层次分明',
    price: 38.8,
    originalPrice: 52.0,
    images: [
      img('premium pork belly, marbled meat, butcher display'),
      img('fresh pork belly slices, white background, product photo'),
      img('braised pork belly dish, Chinese cuisine, food photography')
    ],
    categoryId: 3,
    specs: [
      { name: '规格', values: ['500g', '1kg'] },
      { name: '品质', values: ['黑猪肉', '土猪肉'] }
    ],
    sales: 3450,
    rating: 4.8,
    tags: ['有机', '产地直发'],
    reviews: [
      {
        id: 18,
        username: '红烧肉达人',
        avatar: img('chef woman avatar, cartoon'),
        content: '做红烧肉一绝，肥而不腻！',
        rating: 5,
        images: [img('braised pork belly in bowl, Chinese food')],
        createdAt: '2026-05-21'
      },
      {
        id: 19,
        username: '美食家',
        avatar: img('food critic man avatar, cartoon'),
        content: '肉质很好，层次分明，和超市的完全不一样',
        rating: 5,
        images: [],
        createdAt: '2026-05-18'
      }
    ]
  },
  {
    id: 10,
    name: '挪威三文鱼',
    subtitle: '冰鲜空运 入口即化',
    price: 59.9,
    originalPrice: 79.9,
    images: [
      img('fresh Norwegian salmon fillet, ice display, seafood market'),
      img('salmon sashimi slices, Japanese food, white plate'),
      img('whole salmon, seafood product photo, white background')
    ],
    categoryId: 4,
    specs: [
      { name: '规格', values: ['250g', '500g'] },
      { name: '加工', values: ['整块', '切片'] }
    ],
    sales: 2150,
    rating: 4.9,
    tags: ['产地直发', '当季热卖'],
    reviews: [
      {
        id: 20,
        username: '日料控',
        avatar: img('sushi lover avatar, cartoon'),
        content: '做刺身一级棒，鲜甜无比！',
        rating: 5,
        images: [img('salmon sashimi platter, Japanese cuisine')],
        createdAt: '2026-05-23'
      },
      {
        id: 21,
        username: '海鲜迷',
        avatar: img('man with fish avatar, cartoon'),
        content: '空运确实不一样，很新鲜',
        rating: 5,
        images: [],
        createdAt: '2026-05-20'
      }
    ]
  },
  {
    id: 11,
    name: '大连基围虾',
    subtitle: '活虾速冻 鲜甜弹牙',
    price: 45.8,
    originalPrice: 59.0,
    images: [
      img('fresh shrimp on ice, seafood market, close-up'),
      img('boiled shrimp red, Chinese seafood dish, white plate'),
      img('live shrimp in tank, seafood product, clear water')
    ],
    categoryId: 4,
    specs: [
      { name: '规格', values: ['500g', '1kg'] },
      { name: '大小', values: ['中号', '大号', '特大号'] }
    ],
    sales: 3200,
    rating: 4.7,
    tags: ['产地直发'],
    reviews: [
      {
        id: 22,
        username: '虾控',
        avatar: img('woman eating shrimp avatar, cartoon'),
        content: '白灼就很好吃，虾肉很弹',
        rating: 5,
        images: [img('boiled shrimp on plate, Chinese food')],
        createdAt: '2026-05-22'
      },
      {
        id: 23,
        username: '海边人',
        avatar: img('beach man avatar, cartoon'),
        content: '新鲜度可以，和海鲜市场的差不多',
        rating: 4,
        images: [],
        createdAt: '2026-05-19'
      }
    ]
  },
  {
    id: 12,
    name: '舟山带鱼',
    subtitle: '东海小眼 鲜嫩肥美',
    price: 32.5,
    originalPrice: 45.0,
    images: [
      img('fresh hairtail fish on ice, seafood market, silver skin'),
      img('fried hairtail fish, Chinese dish, golden crispy'),
      img('frozen hairtail fish, seafood product photo')
    ],
    categoryId: 4,
    specs: [
      { name: '规格', values: ['500g', '1kg'] },
      { name: '加工', values: ['整条', '段切'] }
    ],
    sales: 1870,
    rating: 4.6,
    tags: ['产地直发', '当季热卖'],
    reviews: [
      {
        id: 24,
        username: '鱼老板',
        avatar: img('fisherman avatar, cartoon'),
        content: '带鱼很宽，肉质厚实，煎着吃很香',
        rating: 5,
        images: [img('pan-fried hairtail fish, Chinese cuisine')],
        createdAt: '2026-05-21'
      },
      {
        id: 25,
        username: '家常菜',
        avatar: img('home cooking woman avatar, cartoon'),
        content: '红烧带鱼很下饭，新鲜度满意',
        rating: 4,
        images: [],
        createdAt: '2026-05-17'
      }
    ]
  },
  {
    id: 13,
    name: '新希望鲜牛奶',
    subtitle: '每日配送 当天生产',
    price: 9.9,
    originalPrice: 13.0,
    images: [
      img('fresh milk bottle on farm, green pasture, morning light'),
      img('glass of white milk, product photo, white background'),
      img('fresh milk cartons, dairy product display')
    ],
    categoryId: 5,
    specs: [
      { name: '规格', values: ['200ml', '950ml'] },
      { name: '类型', values: ['全脂', '低脂'] }
    ],
    sales: 12300,
    rating: 4.8,
    tags: ['当季热卖', '产地直发'],
    reviews: [
      {
        id: 26,
        username: '牛奶爱好者',
        avatar: img('girl drinking milk avatar, cartoon'),
        content: '口感醇厚，比常温奶好喝太多了',
        rating: 5,
        images: [],
        createdAt: '2026-05-23'
      },
      {
        id: 27,
        username: '营养师',
        avatar: img('nutritionist woman avatar, cartoon'),
        content: '蛋白质含量高，适合全家饮用',
        rating: 4,
        images: [img('milk and cereal breakfast, healthy food')],
        createdAt: '2026-05-20'
      }
    ]
  },
  {
    id: 14,
    name: '安佳淡奶油',
    subtitle: '新西兰进口 易打发',
    price: 28.8,
    originalPrice: 35.0,
    images: [
      img('whipping cream in bowl, baking ingredient, white fluffy'),
      img('Anchor cream product, dairy product photo'),
      img('decorated cake with whipped cream, bakery')
    ],
    categoryId: 5,
    specs: [
      { name: '规格', values: ['250ml', '1L'] },
      { name: '用途', values: ['烘焙', '咖啡'] }
    ],
    sales: 4560,
    rating: 4.7,
    tags: ['当季热卖'],
    reviews: [
      {
        id: 28,
        username: '烘焙达人',
        avatar: img('baker woman avatar, cartoon'),
        content: '打发很快，做蛋糕很稳定',
        rating: 5,
        images: [img('whipped cream cake, homemade bakery')],
        createdAt: '2026-05-22'
      },
      {
        id: 29,
        username: '咖啡控',
        avatar: img('coffee lover avatar, cartoon'),
        content: '拿铁拉花很合适，奶味浓郁',
        rating: 4,
        images: [],
        createdAt: '2026-05-18'
      }
    ]
  },
  {
    id: 15,
    name: '曼可顿全麦面包',
    subtitle: '粗粮健康 饱腹感强',
    price: 12.5,
    originalPrice: 16.8,
    images: [
      img('whole wheat bread loaf, sliced, bakery product'),
      img('whole wheat bread package, product photo, white background'),
      img('toast with avocado and egg, healthy breakfast')
    ],
    categoryId: 5,
    specs: [
      { name: '规格', values: ['400g', '800g'] },
      { name: '口味', values: ['原味', '核桃味'] }
    ],
    sales: 6780,
    rating: 4.5,
    tags: ['当季热卖'],
    reviews: [
      {
        id: 30,
        username: '减脂餐',
        avatar: img('fitness girl avatar, cartoon'),
        content: '全麦含量高，做三明治很好',
        rating: 4,
        images: [img('whole wheat sandwich, healthy lunch')],
        createdAt: '2026-05-21'
      },
      {
        id: 31,
        username: '早餐控',
        avatar: img('morning person avatar, cartoon'),
        content: '口感扎实，饱腹感很强',
        rating: 4,
        images: [],
        createdAt: '2026-05-19'
      }
    ]
  },
  {
    id: 16,
    name: '五常大米',
    subtitle: '正宗稻花香 软糯香甜',
    price: 39.9,
    originalPrice: 55.0,
    images: [
      img('premium Wuchang rice grains, close-up, white background'),
      img('bag of premium rice, product photo, Chinese brand'),
      img('steamed white rice in bowl, Chinese staple food')
    ],
    categoryId: 6,
    specs: [
      { name: '规格', values: ['5kg', '10kg'] },
      { name: '品种', values: ['稻花香2号', '长粒香'] }
    ],
    sales: 9870,
    rating: 4.9,
    tags: ['产地直发', '有机'],
    reviews: [
      {
        id: 32,
        username: '米饭控',
        avatar: img('Asian man eating rice avatar, cartoon'),
        content: '煮出来满屋米香，不用配菜都能吃两碗',
        rating: 5,
        images: [img('steamed rice in wooden bowl, close-up')],
        createdAt: '2026-05-23'
      },
      {
        id: 33,
        username: '东北人',
        avatar: img('man from northeast avatar, cartoon'),
        content: '正宗五常味，比超市的香多了',
        rating: 5,
        images: [],
        createdAt: '2026-05-20'
      }
    ]
  },
  {
    id: 17,
    name: '鲁花花生油',
    subtitle: '物理压榨 花生浓香',
    price: 79.9,
    originalPrice: 99.0,
    images: [
      img('peanut oil bottle, Chinese cooking oil, product photo'),
      img('golden peanut oil in glass, cooking ingredient'),
      img('stir fry vegetables in wok, Chinese cooking, sizzling')
    ],
    categoryId: 6,
    specs: [
      { name: '规格', values: ['1.5L', '5L'] },
      { name: '等级', values: ['一级', '特级'] }
    ],
    sales: 5430,
    rating: 4.8,
    tags: ['产地直发', '当季热卖'],
    reviews: [
      {
        id: 34,
        username: '厨神',
        avatar: img('Chinese chef avatar, cartoon'),
        content: '炒菜特别香，花生味浓郁',
        rating: 5,
        images: [],
        createdAt: '2026-05-22'
      },
      {
        id: 35,
        username: '家常菜',
        avatar: img('home cooking woman avatar, cartoon'),
        content: '比调和油香多了，值得买',
        rating: 4,
        images: [img('stir-fried vegetables in wok, Chinese home cooking')],
        createdAt: '2026-05-18'
      }
    ]
  },
  {
    id: 18,
    name: '海天生抽酱油',
    subtitle: '鲜味突出 烹饪百搭',
    price: 11.9,
    originalPrice: 15.8,
    images: [
      img('soy sauce bottle, Chinese condiment, product photo'),
      img('pouring soy sauce on dumplings, Chinese food'),
      img('Chinese condiment collection, kitchen shelf')
    ],
    categoryId: 6,
    specs: [
      { name: '规格', values: ['500ml', '1.9L'] },
      { name: '系列', values: ['味极鲜', '特级生抽'] }
    ],
    sales: 11200,
    rating: 4.6,
    tags: ['当季热卖'],
    reviews: [
      {
        id: 36,
        username: '调味达人',
        avatar: img('cooking expert avatar, cartoon'),
        content: '鲜味很足，蘸饺子一绝',
        rating: 5,
        images: [],
        createdAt: '2026-05-21'
      },
      {
        id: 37,
        username: '家庭主妇',
        avatar: img('housewife avatar, cartoon'),
        content: '用了好多年了，品质稳定',
        rating: 4,
        images: [img('dumplings with soy sauce dip, Chinese food')],
        createdAt: '2026-05-17'
      }
    ]
  },
  {
    id: 19,
    name: '三只松鼠坚果礼盒',
    subtitle: '每日坚果 营养均衡',
    price: 69.9,
    originalPrice: 99.0,
    images: [
      img('mixed nuts gift box, almonds cashews walnuts, product photo'),
      img('assorted nuts in small packets, daily nutrition'),
      img('open nut gift box, premium nuts, festive packaging')
    ],
    categoryId: 7,
    specs: [
      { name: '规格', values: ['30日装', '15日装'] },
      { name: '口味', values: ['原味', '盐焗'] }
    ],
    sales: 8760,
    rating: 4.7,
    tags: ['有机', '当季热卖'],
    reviews: [
      {
        id: 38,
        username: '办公室白领',
        avatar: img('office woman avatar, cartoon'),
        content: '每天一包，下午茶必备',
        rating: 5,
        images: [img('nuts packet on office desk, snack')],
        createdAt: '2026-05-23'
      },
      {
        id: 39,
        username: '送礼达人',
        avatar: img('gift person avatar, cartoon'),
        content: '包装精美，送礼很合适',
        rating: 4,
        images: [],
        createdAt: '2026-05-20'
      }
    ]
  },
  {
    id: 20,
    name: '良品铺子肉松饼',
    subtitle: '层层酥脆 咸甜适口',
    price: 19.9,
    originalPrice: 29.9,
    images: [
      img('meat floss pastry, Chinese snack, close-up, golden crust'),
      img('packaged meat floss cake, snack product photo'),
      img('cross section of meat floss pastry, showing filling')
    ],
    categoryId: 7,
    specs: [
      { name: '规格', values: ['280g', '560g'] },
      { name: '口味', values: ['原味', '海苔味'] }
    ],
    sales: 6540,
    rating: 4.5,
    tags: ['当季热卖'],
    reviews: [
      {
        id: 40,
        username: '零食控',
        avatar: img('snack lover avatar, cartoon'),
        content: '酥皮很薄，肉松很多，好吃停不下来',
        rating: 5,
        images: [],
        createdAt: '2026-05-22'
      },
      {
        id: 41,
        username: '追剧达人',
        avatar: img('woman watching TV avatar, cartoon'),
        content: '追剧必备小零食，咸甜适口',
        rating: 4,
        images: [img('snacks on coffee table, casual setting')],
        createdAt: '2026-05-19'
      }
    ]
  },
  {
    id: 21,
    name: '百草味芒果干',
    subtitle: '自然风干 酸甜软糯',
    price: 15.8,
    originalPrice: 22.0,
    images: [
      img('dried mango slices, tropical snack, golden color'),
      img('packaged dried mango, snack product photo, white background'),
      img('dried mango in hand, close-up, chewy texture')
    ],
    categoryId: 7,
    specs: [
      { name: '规格', values: ['120g', '240g'] },
      { name: '口味', values: ['原味', '酸梅味'] }
    ],
    sales: 4320,
    rating: 4.6,
    tags: ['产地直发'],
    reviews: [
      {
        id: 42,
        username: '果干控',
        avatar: img('fruit lover avatar, cartoon'),
        content: '芒果味很浓，酸酸甜甜很开胃',
        rating: 5,
        images: [img('dried mango slices in bowl, tropical snack')],
        createdAt: '2026-05-21'
      },
      {
        id: 43,
        username: '甜品师',
        avatar: img('dessert chef avatar, cartoon'),
        content: '做蛋糕装饰也很好看，天然的颜色',
        rating: 4,
        images: [],
        createdAt: '2026-05-17'
      }
    ]
  },
  {
    id: 22,
    name: '青岛啤酒经典',
    subtitle: '百年工艺 麦香浓郁',
    price: 6.5,
    originalPrice: 8.0,
    images: [
      img('Tsingtao beer bottle, Chinese beer, cold with condensation'),
      img('glass of golden beer with foam, refreshing drink'),
      img('Tsingtao beer pack, product photo, Chinese brewery')
    ],
    categoryId: 8,
    specs: [
      { name: '规格', values: ['330ml', '500ml'] },
      { name: '包装', values: ['瓶装', '罐装'] }
    ],
    sales: 15600,
    rating: 4.7,
    tags: ['当季热卖'],
    reviews: [
      {
        id: 44,
        username: '啤酒爱好者',
        avatar: img('man with beer avatar, cartoon'),
        content: '夏天的快乐水，冰一下更好喝',
        rating: 5,
        images: [img('cold Tsingtao beer with BBQ, summer party')],
        createdAt: '2026-05-23'
      },
      {
        id: 45,
        username: '烧烤控',
        avatar: img('BBQ lover avatar, cartoon'),
        content: '配烧烤绝了，口感清爽',
        rating: 4,
        images: [],
        createdAt: '2026-05-20'
      }
    ]
  },
  {
    id: 23,
    name: '农夫山泉矿泉水',
    subtitle: '天然弱碱 甘甜清冽',
    price: 2.0,
    originalPrice: 2.5,
    images: [
      img('Nongfu Spring water bottle, mineral water, product photo'),
      img('clear mountain stream, natural spring water source'),
      img('stacked water bottles, beverage product display')
    ],
    categoryId: 8,
    specs: [
      { name: '规格', values: ['550ml', '2L', '4L'] },
      { name: '系列', values: ['红瓶', '玻璃瓶'] }
    ],
    sales: 32000,
    rating: 4.8,
    tags: ['产地直发'],
    reviews: [
      {
        id: 46,
        username: '运动达人',
        avatar: img('athlete man avatar, cartoon'),
        content: '运动后必备，水质清甜',
        rating: 5,
        images: [],
        createdAt: '2026-05-22'
      },
      {
        id: 47,
        username: '办公室白领',
        avatar: img('office woman avatar, cartoon'),
        content: '日常饮用水，品质放心',
        rating: 4,
        images: [img('water bottle on office desk, daily life')],
        createdAt: '2026-05-19'
      }
    ]
  },
  {
    id: 24,
    name: '汇源100%橙汁',
    subtitle: '鲜果榨取 无添加',
    price: 8.8,
    originalPrice: 12.0,
    images: [
      img('fresh orange juice in glass, bright orange color, ice cubes'),
      img('Huiyuan orange juice carton, Chinese beverage, product photo'),
      img('oranges being juiced, fresh fruit, citrus, vibrant')
    ],
    categoryId: 8,
    specs: [
      { name: '规格', values: ['1L', '2L'] },
      { name: '口味', values: ['橙汁', '苹果汁'] }
    ],
    sales: 7890,
    rating: 4.5,
    tags: ['有机', '当季热卖'],
    reviews: [
      {
        id: 48,
        username: '果汁控',
        avatar: img('juice lover avatar, cartoon'),
        content: '100%纯果汁，没有加糖加水的味道',
        rating: 5,
        images: [img('orange juice with breakfast, morning meal')],
        createdAt: '2026-05-21'
      },
      {
        id: 49,
        username: '宝妈日记',
        avatar: img('mother avatar, cartoon style'),
        content: '孩子喜欢喝，无添加更放心',
        rating: 4,
        images: [],
        createdAt: '2026-05-18'
      }
    ]
  }
]

export const flashSaleProducts: Product[] = [
  {
    id: 101,
    name: '智利车厘子',
    subtitle: 'JJ级大果 限时秒杀',
    price: 49.9,
    originalPrice: 129.9,
    images: [
      img('fresh dark cherries in box, Chilean fruit, premium quality'),
      img('handful of large dark cherries, close-up, product photo'),
      img('cherry on tree, red fruit, orchard, sunlight')
    ],
    categoryId: 1,
    specs: [
      { name: '规格', values: ['2斤装', '5斤装'] },
      { name: '等级', values: ['JJ级', 'JJJ级'] }
    ],
    sales: 6780,
    rating: 4.9,
    tags: ['产地直发', '限时秒杀'],
    reviews: [
      {
        id: 50,
        username: '车厘子自由',
        avatar: img('happy woman with cherries avatar, cartoon'),
        content: '比水果店便宜一半，个头还更大！',
        rating: 5,
        images: [img('large cherries in hand, size comparison')],
        createdAt: '2026-05-24'
      },
      {
        id: 51,
        username: '精致生活',
        avatar: img('elegant woman avatar, cartoon'),
        content: '送给闺蜜的，她说太划算了',
        rating: 5,
        images: [],
        createdAt: '2026-05-23'
      }
    ]
  },
  {
    id: 102,
    name: '阳澄湖大闸蟹',
    subtitle: '正宗产地 鲜肥膏满',
    price: 88.0,
    originalPrice: 198.0,
    images: [
      img('live hairy crabs, Yangcheng Lake, Chinese delicacy'),
      img('steamed hairy crab with roe, Chinese cuisine, golden paste'),
      img('hairy crab gift box, premium Chinese seafood')
    ],
    categoryId: 4,
    specs: [
      { name: '规格', values: ['4只装', '8只装'] },
      { name: '公母', values: ['公蟹4两', '母蟹3两'] }
    ],
    sales: 3450,
    rating: 4.8,
    tags: ['产地直发', '限时秒杀'],
    reviews: [
      {
        id: 52,
        username: '螃蟹控',
        avatar: img('man eating crab avatar, cartoon'),
        content: '蟹膏满到溢出来，太值了！',
        rating: 5,
        images: [img('hairy crab with golden roe, close-up')],
        createdAt: '2026-05-24'
      },
      {
        id: 53,
        username: '老饕',
        avatar: img('food expert avatar, cartoon'),
        content: '正宗阳澄湖的，一吃就知道',
        rating: 5,
        images: [],
        createdAt: '2026-05-22'
      }
    ]
  },
  {
    id: 103,
    name: '新疆阿克苏冰糖心苹果',
    subtitle: '果核透亮 甜如冰糖',
    price: 19.9,
    originalPrice: 45.0,
    images: [
      img('Aksu ice sugar heart apple, sliced showing transparent core'),
      img('red apples on tree, Xinjiang orchard, autumn harvest'),
      img('box of premium Aksu apples, Chinese fruit, product photo')
    ],
    categoryId: 1,
    specs: [
      { name: '规格', values: ['5斤装', '10斤装'] },
      { name: '等级', values: ['特级', '一级'] }
    ],
    sales: 8900,
    rating: 4.9,
    tags: ['产地直发', '限时秒杀'],
    reviews: [
      {
        id: 54,
        username: '甜食控',
        avatar: img('sweet tooth avatar, cartoon'),
        content: '冰糖心是真的，甜到心里了',
        rating: 5,
        images: [img('apple slice showing sugar core, close-up')],
        createdAt: '2026-05-24'
      },
      {
        id: 55,
        username: '新疆迷',
        avatar: img('man from Xinjiang avatar, cartoon'),
        content: '正宗阿克苏的，比当地买的还便宜',
        rating: 5,
        images: [],
        createdAt: '2026-05-23'
      }
    ]
  },
  {
    id: 104,
    name: '澳洲安格斯牛排',
    subtitle: 'M5雪花 煎烤皆宜',
    price: 59.0,
    originalPrice: 128.0,
    images: [
      img('Angus beef steak, marbled M5 grade, raw meat display'),
      img('grilled steak medium rare, golden crust, food photography'),
      img('vacuum packed premium steak, Australian beef, product photo')
    ],
    categoryId: 3,
    specs: [
      { name: '规格', values: ['200g', '300g'] },
      { name: '部位', values: ['西冷', '眼肉', '菲力'] }
    ],
    sales: 2340,
    rating: 4.8,
    tags: ['产地直发', '限时秒杀'],
    reviews: [
      {
        id: 56,
        username: '牛排控',
        avatar: img('steak lover avatar, cartoon'),
        content: 'M5雪花真不是盖的，煎五分熟刚刚好',
        rating: 5,
        images: [img('perfect medium rare steak on plate, fine dining')],
        createdAt: '2026-05-24'
      },
      {
        id: 57,
        username: '西餐爱好者',
        avatar: img('western food lover avatar, cartoon'),
        content: '性价比太高了，比西餐厅便宜多了',
        rating: 5,
        images: [],
        createdAt: '2026-05-22'
      }
    ]
  }
]

export function getProductById(id: number): Product | undefined {
  return [...products, ...flashSaleProducts, ...newUserProducts].find((p) => p.id === id)
}

export function getProductsByCategory(categoryId: number): Product[] {
  return products.filter((p) => p.categoryId === categoryId)
}

export function searchProducts(keyword: string): Product[] {
  const kw = keyword.toLowerCase()
  return [...products, ...flashSaleProducts].filter(
    (p) =>
      p.name.toLowerCase().includes(kw) ||
      p.subtitle.toLowerCase().includes(kw) ||
      p.tags.some((t) => t.toLowerCase().includes(kw))
  )
}

export const newUserCoupon: Coupon = {
  id: 999,
  name: '新人专享首单立减',
  type: 'fixed',
  value: 15,
  minAmount: 30,
  description: '新人首单满30元立减15元，全场通用',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'unused',
  scope: 'all'
}

export const newUserProducts: Product[] = [
  {
    id: 201,
    name: '山东红富士苹果',
    subtitle: '新人专享 脆甜多汁',
    price: 9.9,
    originalPrice: 18.9,
    images: [
      img('fresh red Fuji apple on tree, close-up, bright sunlight, farm background'),
      img('basket of red Fuji apples, clean white background, product photo'),
      img('sliced red Fuji apple showing juicy interior, food photography')
    ],
    categoryId: 1,
    specs: [
      { name: '规格', values: ['5斤装'] },
      { name: '产地', values: ['山东烟台'] }
    ],
    sales: 8856,
    rating: 4.9,
    tags: ['新人专享', '产地直发', '限购1件'],
  },
  {
    id: 202,
    name: '云南高原蓝莓',
    subtitle: '新人特惠 花青素满满',
    price: 19.9,
    originalPrice: 49.9,
    images: [
      img('fresh blueberries on bush, close-up, morning dew'),
      img('bowl of fresh blueberries, white background, product photo'),
      img('handful of blueberries, food photography, vibrant color')
    ],
    categoryId: 1,
    specs: [
      { name: '规格', values: ['250g'] },
      { name: '等级', values: ['特大果'] }
    ],
    sales: 6560,
    rating: 4.8,
    tags: ['新人专享', '有机', '限购1件'],
  },
  {
    id: 203,
    name: '正大土鸡蛋',
    subtitle: '新人尝鲜 蛋黄饱满',
    price: 12.9,
    originalPrice: 32.0,
    images: [
      img('farm fresh eggs in basket, countryside, morning light'),
      img('box of eggs, product photo, white background'),
      img('cracked egg showing golden yolk, food photography')
    ],
    categoryId: 3,
    specs: [
      { name: '规格', values: ['20枚装'] },
      { name: '品种', values: ['土鸡蛋'] }
    ],
    sales: 12820,
    rating: 4.8,
    tags: ['新人专享', '有机', '限购1件'],
  },
  {
    id: 204,
    name: '新希望鲜牛奶',
    subtitle: '新人价 每日配送',
    price: 5.9,
    originalPrice: 13.0,
    images: [
      img('fresh milk bottle on farm, green pasture, morning light'),
      img('glass of white milk, product photo, white background'),
      img('fresh milk cartons, dairy product display')
    ],
    categoryId: 5,
    specs: [
      { name: '规格', values: ['950ml'] },
      { name: '类型', values: ['全脂'] }
    ],
    sales: 18300,
    rating: 4.9,
    tags: ['新人专享', '当日鲜', '限购1件'],
  }
]

export const newUserZoneData: NewUserZoneData = {
  banner: {
    title: '新人专享',
    subtitle: '首单立减15元',
    couponValue: 15,
    minAmount: 30
  },
  coupon: newUserCoupon,
  products: newUserProducts
}
