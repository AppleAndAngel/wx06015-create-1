import type { SolarTerm, Recipe, RecipeIngredient, SeasonalRecipeData } from '@/types'
import { products, getProductById } from './products'

const img = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`

const springGradient = 'linear-gradient(135deg, #66BB6A, #81C784)'
const summerGradient = 'linear-gradient(135deg, #FF7043, #FF8A65)'
const autumnGradient = 'linear-gradient(135deg, #FFA726, #FFB74D)'
const winterGradient = 'linear-gradient(135deg, #42A5F5, #64B5F6)'

export const solarTerms: SolarTerm[] = [
  { name: '立春', englishName: 'Start of Spring', date: '02-04', season: 'spring', description: '东风解冻，蛰虫始振', healthTip: '宜食辛温发散之品，如葱、香菜、花生等', icon: '🌱', gradient: springGradient },
  { name: '雨水', englishName: 'Rain Water', date: '02-19', season: 'spring', description: '獭祭鱼，鸿雁来', healthTip: '宜食健脾祛湿之物，如山药、薏米、红枣等', icon: '🌧️', gradient: springGradient },
  { name: '惊蛰', englishName: 'Awakening of Insects', date: '03-06', season: 'spring', description: '桃始华，仓庚鸣', healthTip: '宜食清淡甘润，如梨、银耳、百合等', icon: '🐝', gradient: springGradient },
  { name: '春分', englishName: 'Spring Equinox', date: '03-21', season: 'spring', description: '玄鸟至，雷乃发声', healthTip: '宜食时令蔬菜，如荠菜、豆芽、香椿等', icon: '🌸', gradient: springGradient },
  { name: '清明', englishName: 'Pure Brightness', date: '04-05', season: 'spring', description: '桐始华，田鼠化为鴽', healthTip: '宜食养肝护肝，如菠菜、芹菜、枸杞等', icon: '🌿', gradient: springGradient },
  { name: '谷雨', englishName: 'Grain Rain', date: '04-20', season: 'spring', description: '萍始生，鸣鸠拂其羽', healthTip: '宜食祛湿健脾，如茯苓、冬瓜、赤小豆等', icon: '🌾', gradient: springGradient },
  { name: '立夏', englishName: 'Start of Summer', date: '05-06', season: 'summer', description: '蝼蝈鸣，蚯蚓出', healthTip: '宜食清热消暑，如苦瓜、绿豆、西瓜等', icon: '☀️', gradient: summerGradient },
  { name: '小满', englishName: 'Grain Buds', date: '05-21', season: 'summer', description: '苦菜秀，靡草死', healthTip: '宜食清热利湿，如苦菜、马齿苋、黄瓜等', icon: '🌻', gradient: summerGradient },
  { name: '芒种', englishName: 'Grain in Ear', date: '06-06', season: 'summer', description: '螳螂生，鵙始鸣', healthTip: '宜食清补为主，如酸梅汤、莲子、百合等', icon: '🌾', gradient: summerGradient },
  { name: '夏至', englishName: 'Summer Solstice', date: '06-21', season: 'summer', description: '鹿角解，蜩始鸣', healthTip: '宜食清心养肺，如西瓜、丝瓜、莲子等', icon: '🌞', gradient: summerGradient },
  { name: '小暑', englishName: 'Minor Heat', date: '07-07', season: 'summer', description: '温风至，蟋蟀居宇', healthTip: '宜食清热解暑，如绿豆汤、冬瓜、荷叶等', icon: '🔥', gradient: summerGradient },
  { name: '大暑', englishName: 'Major Heat', date: '07-23', season: 'summer', description: '腐草为萤，土润溽暑', healthTip: '宜食益气养阴，如鸭肉、银耳、百合等', icon: '🌡️', gradient: summerGradient },
  { name: '立秋', englishName: 'Start of Autumn', date: '08-08', season: 'autumn', description: '凉风至，白露生', healthTip: '宜食润肺生津，如梨、银耳、蜂蜜等', icon: '🍂', gradient: autumnGradient },
  { name: '处暑', englishName: 'End of Heat', date: '08-23', season: 'autumn', description: '鹰乃祭鸟，天地始肃', healthTip: '宜食滋阴润燥，如鸭肉、百合、莲子等', icon: '🌤️', gradient: autumnGradient },
  { name: '白露', englishName: 'White Dew', date: '09-08', season: 'autumn', description: '鸿雁来，玄鸟归', healthTip: '宜食补养肺气，如杏仁、白果、山药等', icon: '💧', gradient: autumnGradient },
  { name: '秋分', englishName: 'Autumn Equinox', date: '09-23', season: 'autumn', description: '雷始收声，蛰虫坯户', healthTip: '宜食滋阴润肺，如秋梨、百合、银耳等', icon: '🍁', gradient: autumnGradient },
  { name: '寒露', englishName: 'Cold Dew', date: '10-08', season: 'autumn', description: '鸿雁来宾，雀入大水为蛤', healthTip: '宜食温润养肺，如芝麻、糯米、蜂蜜等', icon: '🌫️', gradient: autumnGradient },
  { name: '霜降', englishName: 'Frost Descent', date: '10-24', season: 'autumn', description: '豺乃祭兽，草木黄落', healthTip: '宜食平补滋阴，如柿子、栗子、萝卜等', icon: '❄️', gradient: autumnGradient },
  { name: '立冬', englishName: 'Start of Winter', date: '11-08', season: 'winter', description: '水始冰，地始冻', healthTip: '宜食温补养肾，如羊肉、牛肉、栗子等', icon: '⛄', gradient: winterGradient },
  { name: '小雪', englishName: 'Minor Snow', date: '11-22', season: 'winter', description: '虹藏不见，天气上升', healthTip: '宜食温补肾阳，如羊肉、核桃、黑芝麻等', icon: '🌨️', gradient: winterGradient },
  { name: '大雪', englishName: 'Major Snow', date: '12-07', season: 'winter', description: '鹖鴠不鸣，虎始交', healthTip: '宜食补阳滋阴，如羊肉、牛肉、木耳等', icon: '❄️', gradient: winterGradient },
  { name: '冬至', englishName: 'Winter Solstice', date: '12-22', season: 'winter', description: '蚯蚓结，麋角解', healthTip: '宜食温补阳气，如羊肉、饺子、汤圆等', icon: '🌙', gradient: winterGradient },
  { name: '小寒', englishName: 'Minor Cold', date: '01-06', season: 'winter', description: '雁北乡，鹊始巢', healthTip: '宜食温阳散寒，如羊肉、牛肉、生姜等', icon: '🥶', gradient: winterGradient },
  { name: '大寒', englishName: 'Major Cold', date: '01-20', season: 'winter', description: '鸡乳，征鸟厉疾', healthTip: '宜食温补脾肾，如羊肉、糯米、红枣等', icon: '🏔️', gradient: winterGradient },
]

function getCurrentSolarTerm(): SolarTerm {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const currentDateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  
  for (let i = 0; i < solarTerms.length; i++) {
    const term = solarTerms[i]
    const nextTerm = solarTerms[(i + 1) % solarTerms.length]
    
    if (currentDateStr >= term.date && currentDateStr < nextTerm.date) {
      return term
    }
  }
  
  return solarTerms[3]
}

function makeIngredients(items: Array<{ productId: number; quantity: string }>): RecipeIngredient[] {
  return items.map((item, index) => {
    const product = getProductById(item.productId)
    return {
      id: index + 1,
      name: product?.name || `食材${index + 1}`,
      quantity: item.quantity,
      productId: item.productId,
      product: product,
    }
  })
}

export const recipes: Recipe[] = [
  {
    id: 1,
    name: '香椿炒鸡蛋',
    subtitle: '春日限定 鲜香扑鼻',
    coverImage: img('Chinese toon scrambled eggs, spring seasonal dish, food photography, restaurant quality'),
    images: [
      img('Chinese toon scrambled eggs on plate, Chinese home cooking, spring dish'),
      img('fresh Chinese toon leaves, spring vegetable, green color'),
      img('cooking toon and eggs in wok, Chinese home kitchen'),
    ],
    solarTerm: '春分',
    season: 'spring',
    difficulty: 'easy',
    cookTime: '15分钟',
    servings: 2,
    calories: 280,
    description: '春分时节，香椿嫩芽初发，是一年中最鲜嫩的时候。搭配土鸡蛋快炒，香气扑鼻，是春日不可错过的时令美味。',
    healthBenefits: ['健脾开胃', '清热解毒', '增强免疫力'],
    ingredients: makeIngredients([
      { productId: 8, quantity: '3枚' },
      { productId: 4, quantity: '200g' },
      { productId: 18, quantity: '适量' },
    ]),
    steps: [
      { order: 1, description: '香椿洗净，放入沸水中焯水1分钟，捞出过凉水，切碎备用', image: img('blanching Chinese toon leaves in boiling water, cooking step') },
      { order: 2, description: '鸡蛋打入碗中，加少许盐打散，加入切碎的香椿拌匀', image: img('mixing eggs with chopped toon, cooking preparation') },
      { order: 3, description: '热锅倒油，油温七成热时倒入蛋液，快速翻炒至凝固即可', image: img('scrambled eggs with toon in wok, Chinese cooking') },
    ],
    tips: ['香椿一定要焯水去除亚硝酸盐', '不要炒太久，保持鸡蛋嫩滑', '选用头茬香椿最嫩'],
    tags: ['时令菜', '快手菜', '春日限定'],
    rating: 4.9,
    viewCount: 12580,
  },
  {
    id: 2,
    name: '冬瓜薏米排骨汤',
    subtitle: '清热祛湿 小满养生',
    coverImage: img('winter melon and coix seed pork rib soup, Chinese healthy soup, food photography'),
    images: [
      img('winter melon soup in ceramic pot, Chinese home cooking, healthy meal'),
      img('fresh winter melon slices, white vegetable, Chinese ingredient'),
      img('pork ribs in soup, slow cooked Chinese soup'),
    ],
    solarTerm: '小满',
    season: 'summer',
    difficulty: 'medium',
    cookTime: '90分钟',
    servings: 4,
    calories: 180,
    description: '小满时节湿气重，冬瓜薏米排骨汤是最佳祛湿养生汤。冬瓜利尿消肿，薏米健脾祛湿，排骨补气养血，三者搭配相得益彰。',
    healthBenefits: ['清热祛湿', '利尿消肿', '健脾益气'],
    ingredients: makeIngredients([
      { productId: 9, quantity: '500g' },
      { productId: 5, quantity: '500g' },
      { productId: 16, quantity: '50g' },
      { productId: 18, quantity: '适量' },
    ]),
    steps: [
      { order: 1, description: '排骨洗净切块，冷水下锅焯水去血沫，捞出冲洗干净', image: img('blanching pork ribs, Chinese soup preparation') },
      { order: 2, description: '薏米提前浸泡2小时，冬瓜去皮去籽切厚片', image: img('preparing winter melon and coix seeds, ingredients') },
      { order: 3, description: '将排骨、薏米放入砂锅，加足量清水，大火煮沸后转小火炖1小时', image: img('slow cooking soup in clay pot, Chinese kitchen') },
      { order: 4, description: '加入冬瓜继续炖30分钟，出锅前加盐调味即可', image: img('adding winter melon to soup, cooking step') },
    ],
    tips: ['薏米提前泡发更容易煮烂', '冬瓜最后放保持口感清甜', '小火慢炖汤色更浓'],
    tags: ['养生汤', '祛湿', '小满'],
    rating: 4.8,
    viewCount: 9870,
  },
  {
    id: 3,
    name: '莲子百合绿豆汤',
    subtitle: '消暑解渴 小暑佳品',
    coverImage: img('mung bean soup with lotus seed and lily bulb, Chinese summer dessert, food photography'),
    images: [
      img('mung bean soup in bowl, chilled Chinese dessert, summer refreshment'),
      img('mung beans, lotus seeds, lily bulbs, Chinese ingredients'),
      img('cooking mung bean soup, Chinese home cooking'),
    ],
    solarTerm: '小暑',
    season: 'summer',
    difficulty: 'easy',
    cookTime: '60分钟',
    servings: 4,
    calories: 120,
    description: '小暑时节天气炎热，绿豆汤是家家必备的消暑佳品。加入莲子百合，不仅口感更丰富，还能养心安神，是夏季养生的不二之选。',
    healthBenefits: ['清热解毒', '消暑止渴', '养心安神'],
    ingredients: makeIngredients([
      { productId: 16, quantity: '200g' },
      { productId: 13, quantity: '100g' },
    ]),
    steps: [
      { order: 1, description: '绿豆洗净，浸泡4小时以上；莲子去芯，百合洗净备用', image: img('soaking mung beans, preparation step') },
      { order: 2, description: '绿豆加水大火煮沸，转小火煮30分钟至开花', image: img('cooking mung beans in pot, Chinese kitchen') },
      { order: 3, description: '加入莲子、百合继续煮20分钟，加冰糖调味', image: img('adding lotus seeds to mung bean soup') },
      { order: 4, description: '关火后放凉，冰镇后口感更佳', image: img('chilled mung bean soup, summer dessert') },
    ],
    tips: ['绿豆泡发后更容易煮开花', '莲子去芯避免苦味', '冰镇后风味更佳'],
    tags: ['消暑', '甜品', '小暑'],
    rating: 4.7,
    viewCount: 15680,
  },
  {
    id: 4,
    name: '川贝冰糖炖雪梨',
    subtitle: '润肺止咳 立秋润燥',
    coverImage: img('chuanbei pear soup with rock sugar, Chinese autumn dessert, food photography'),
    images: [
      img('steamed pear with chuanbei and rock sugar, Chinese home remedy'),
      img('pear cut open with core removed, preparation for steaming'),
      img('chuanbei fritillary bulbs, Chinese medicinal herb'),
    ],
    solarTerm: '立秋',
    season: 'autumn',
    difficulty: 'easy',
    cookTime: '45分钟',
    servings: 2,
    calories: 150,
    description: '立秋后天气干燥，容易咳嗽上火。川贝冰糖炖雪梨是经典的润肺止咳食疗方，雪梨生津润燥，川贝化痰止咳，老少皆宜。',
    healthBenefits: ['润肺止咳', '生津润燥', '清热化痰'],
    ingredients: makeIngredients([
      { productId: 1, quantity: '2个' },
      { productId: 13, quantity: '30g' },
    ]),
    steps: [
      { order: 1, description: '雪梨洗净，从顶部1/4处切开，挖去中间的核', image: img('hollowing out pear core, preparation step') },
      { order: 2, description: '川贝碾成粉，与冰糖一起放入雪梨中间', image: img('adding chuanbei and rock sugar into pear') },
      { order: 3, description: '盖好顶盖，用牙签固定，放入蒸锅', image: img('preparing pear for steaming') },
      { order: 4, description: '大火蒸40分钟即可，趁热食用效果更佳', image: img('steamed pear dessert, Chinese home remedy') },
    ],
    tips: ['选用雪梨或鸭梨效果最好', '川贝要碾成粉更易吸收', '脾胃虚寒者不宜多食'],
    tags: ['润燥', '食疗', '立秋'],
    rating: 4.9,
    viewCount: 18920,
  },
  {
    id: 5,
    name: '栗子焖鸡',
    subtitle: '温补脾肾 霜降进补',
    coverImage: img('chestnut braised chicken, Chinese autumn dish, food photography, restaurant quality'),
    images: [
      img('braised chicken with chestnuts in pot, Chinese home cooking'),
      img('fresh chestnuts, autumn seasonal nut, Chinese ingredient'),
      img('cooking braised chicken, Chinese cuisine'),
    ],
    solarTerm: '霜降',
    season: 'autumn',
    difficulty: 'medium',
    cookTime: '60分钟',
    servings: 4,
    calories: 380,
    description: '霜降时节，栗子正当季。栗子焖鸡是经典的秋季进补菜肴，鸡肉温中益气，栗子补肾强筋，是霜降时节的绝佳养生美食。',
    healthBenefits: ['温补脾肾', '益气养血', '强筋健骨'],
    ingredients: makeIngredients([
      { productId: 9, quantity: '500g' },
      { productId: 18, quantity: '适量' },
      { productId: 8, quantity: '1枚' },
    ]),
    steps: [
      { order: 1, description: '鸡肉切块洗净，冷水下锅焯水去血沫，捞出沥干', image: img('blanching chicken pieces, preparation') },
      { order: 2, description: '栗子去壳，用热水浸泡后剥去内皮', image: img('peeling chestnuts, Chinese ingredient preparation') },
      { order: 3, description: '热锅下油，爆香葱姜，放入鸡块翻炒至表面金黄', image: img('stir frying chicken pieces, Chinese cooking') },
      { order: 4, description: '加生抽、老抽、料酒调味，加开水没过鸡块，放入栗子', image: img('adding chestnuts and sauce to chicken') },
      { order: 5, description: '大火烧开后转小火焖30分钟，最后大火收汁即可', image: img('braised chicken with chestnuts, finished dish') },
    ],
    tips: ['栗子一定要剥去内皮才好吃', '加开水焖煮鸡肉更嫩', '最后大火收汁色泽更亮'],
    tags: ['进补', '家常菜', '霜降'],
    rating: 4.8,
    viewCount: 11250,
  },
  {
    id: 6,
    name: '当归生姜羊肉汤',
    subtitle: '温阳散寒 冬至养生',
    coverImage: img('lamb soup with angelica and ginger, Chinese winter tonic, food photography'),
    images: [
      img('lamb soup in clay pot, Chinese winter tonic, healthy food'),
      img('lamb ribs, ginger slices, angelica root, Chinese medicinal ingredients'),
      img('slow cooking lamb soup, Chinese home kitchen'),
    ],
    solarTerm: '冬至',
    season: 'winter',
    difficulty: 'hard',
    cookTime: '120分钟',
    servings: 6,
    calories: 420,
    description: '冬至大如年，当归生姜羊肉汤是最经典的冬至进补方。羊肉温补气血，当归活血养血，生姜散寒暖胃，三者搭配，是冬季温补的最佳选择。',
    healthBenefits: ['温阳散寒', '补气养血', '暖肾健脾'],
    ingredients: makeIngredients([
      { productId: 7, quantity: '1kg' },
      { productId: 18, quantity: '适量' },
    ]),
    steps: [
      { order: 1, description: '羊肉洗净切块，冷水下锅焯水，加料酒去腥，捞出冲洗干净', image: img('blanching lamb, preparation for soup') },
      { order: 2, description: '当归洗净切片，生姜切厚片备用', image: img('preparing angelica and ginger, Chinese herbs') },
      { order: 3, description: '将羊肉、当归、生姜放入砂锅，加足量清水', image: img('putting ingredients into clay pot') },
      { order: 4, description: '大火煮沸后转小火炖2小时，出锅前加盐调味', image: img('slow cooking lamb soup, Chinese tonic') },
    ],
    tips: ['一定要焯水去除羊肉膻味', '小火慢炖2小时以上效果更好', '感冒发烧者不宜食用'],
    tags: ['进补', '冬至', '养生汤'],
    rating: 4.9,
    viewCount: 22150,
  },
  {
    id: 7,
    name: '凉拌黄瓜',
    subtitle: '清热解暑 立夏开胃',
    coverImage: img('Chinese cold cucumber salad, refreshing summer appetizer, food photography'),
    images: [
      img('cold cucumber salad in bowl, Chinese appetizer, summer dish'),
      img('fresh cucumbers, green vegetable, Chinese ingredient'),
      img('smashing cucumbers with knife, Chinese cooking technique'),
    ],
    solarTerm: '立夏',
    season: 'summer',
    difficulty: 'easy',
    cookTime: '10分钟',
    servings: 2,
    calories: 80,
    description: '立夏后天气渐热，凉拌黄瓜是家家户户必备的开胃小菜。黄瓜清热解暑，加上蒜香和香醋，酸辣爽口，最适合没有胃口的夏天。',
    healthBenefits: ['清热解暑', '开胃消食', '利尿消肿'],
    ingredients: makeIngredients([
      { productId: 5, quantity: '2根' },
      { productId: 18, quantity: '适量' },
    ]),
    steps: [
      { order: 1, description: '黄瓜洗净，用刀背拍碎，切成小段', image: img('smashing cucumber with knife, Chinese technique') },
      { order: 2, description: '加入蒜末、生抽、香醋、少许糖和盐', image: img('adding seasonings to cucumber') },
      { order: 3, description: '淋上少许香油，拌匀后腌制10分钟即可', image: img('mixed cucumber salad, Chinese appetizer') },
    ],
    tips: ['黄瓜拍碎比切的更入味', '腌制10分钟口感最佳', '放入冰箱冷藏后更爽口'],
    tags: ['快手菜', '凉拌', '立夏'],
    rating: 4.6,
    viewCount: 8900,
  },
  {
    id: 8,
    name: '红糖姜枣茶',
    subtitle: '暖身驱寒 小寒必备',
    coverImage: img('brown sugar ginger jujube tea, Chinese winter drink, food photography'),
    images: [
      img('brown sugar ginger tea in cup, Chinese warm drink, winter'),
      img('fresh ginger, red dates, brown sugar, Chinese ingredients'),
      img('boiling ginger tea, Chinese home remedy'),
    ],
    solarTerm: '小寒',
    season: 'winter',
    difficulty: 'easy',
    cookTime: '20分钟',
    servings: 4,
    calories: 90,
    description: '小寒时节天寒地冻，一杯热腾腾的红糖姜枣茶是最好的暖身饮品。生姜驱寒，红枣补血，红糖暖身，三者搭配，让整个冬天都暖洋洋。',
    healthBenefits: ['暖身驱寒', '补气养血', '健脾暖胃'],
    ingredients: makeIngredients([
      { productId: 13, quantity: '100g' },
    ]),
    steps: [
      { order: 1, description: '生姜洗净切片，红枣去核备用', image: img('slicing ginger and preparing red dates') },
      { order: 2, description: '将生姜、红枣放入锅中，加适量清水', image: img('putting ingredients into pot') },
      { order: 3, description: '大火烧开后转小火煮15分钟', image: img('boiling ginger tea, Chinese home cooking') },
      { order: 4, description: '加入红糖煮至融化，趁热饮用', image: img('brown sugar ginger tea, warm drink') },
    ],
    tips: ['生姜不要去皮，驱寒效果更好', '红糖最后放，营养不流失', '糖尿病患者少放糖'],
    tags: ['饮品', '暖身', '小寒'],
    rating: 4.8,
    viewCount: 14320,
  },
  {
    id: 9,
    name: '清炒西兰花',
    subtitle: '养肝明目 清明养生',
    coverImage: img('stir fried broccoli, Chinese healthy vegetable dish, food photography'),
    images: [
      img('garlic broccoli on plate, Chinese vegetable dish, healthy food'),
      img('fresh broccoli head, green vegetable, Chinese ingredient'),
      img('stir frying broccoli in wok, Chinese cooking'),
    ],
    solarTerm: '清明',
    season: 'spring',
    difficulty: 'easy',
    cookTime: '10分钟',
    servings: 2,
    calories: 120,
    description: '清明时节重在养肝，西兰花富含维生素和花青素，是养肝护肝的最佳蔬菜。简单的蒜蓉清炒，最大程度保留了西兰花的营养和清甜口感。',
    healthBenefits: ['养肝护肝', '明目护眼', '增强免疫力'],
    ingredients: makeIngredients([
      { productId: 6, quantity: '1颗' },
      { productId: 18, quantity: '适量' },
    ]),
    steps: [
      { order: 1, description: '西兰花切小朵，洗净后用盐水浸泡10分钟', image: img('soaking broccoli in salt water, preparation') },
      { order: 2, description: '烧一锅开水，加少许盐和油，将西兰花焯水1分钟', image: img('blanching broccoli in boiling water') },
      { order: 3, description: '热锅下油，爆香蒜末，倒入西兰花快速翻炒', image: img('stir frying broccoli with garlic, Chinese cooking') },
      { order: 4, description: '加少许盐调味，翻炒均匀即可出锅', image: img('garlic broccoli finished dish, Chinese vegetable') },
    ],
    tips: ['西兰花用盐水浸泡可以去除小虫', '焯水时间不要太长，保持脆嫩', '大火快炒口感更好'],
    tags: ['素菜', '养肝', '清明'],
    rating: 4.7,
    viewCount: 7650,
  },
  {
    id: 10,
    name: '白萝卜炖羊肉',
    subtitle: '温补脾肾 大雪养生',
    coverImage: img('white radish lamb stew, Chinese winter dish, food photography'),
    images: [
      img('lamb and radish stew in pot, Chinese winter food'),
      img('white radish and lamb, Chinese ingredients'),
      img('slow cooking lamb stew, Chinese home cooking'),
    ],
    solarTerm: '大雪',
    season: 'winter',
    difficulty: 'medium',
    cookTime: '90分钟',
    servings: 6,
    calories: 350,
    description: '大雪时节天寒地冻，正是进补的好时机。白萝卜炖羊肉是北方冬季最常见的家常菜，羊肉温补，萝卜消积，一补一消，补而不腻。',
    healthBenefits: ['温补脾肾', '益气补虚', '温中暖下'],
    ingredients: makeIngredients([
      { productId: 7, quantity: '800g' },
      { productId: 18, quantity: '适量' },
    ]),
    steps: [
      { order: 1, description: '羊肉切块，冷水下锅焯水去腥，捞出冲洗干净', image: img('blanching lamb, preparation') },
      { order: 2, description: '白萝卜去皮切滚刀块备用', image: img('cutting white radish, preparation') },
      { order: 3, description: '热锅下油，爆香葱姜，放入羊肉翻炒', image: img('stir frying lamb, Chinese cooking') },
      { order: 4, description: '加开水没过羊肉，大火烧开后转小火炖1小时', image: img('slow cooking lamb in pot') },
      { order: 5, description: '加入萝卜继续炖30分钟，出锅前加盐调味', image: img('lamb radish stew, finished dish') },
    ],
    tips: ['羊肉焯水要冷水下锅，去除血水更彻底', '萝卜后放，保持清甜口感', '可以加少许橘子皮去膻'],
    tags: ['进补', '家常菜', '大雪'],
    rating: 4.8,
    viewCount: 13400,
  },
  {
    id: 11,
    name: '蒜蓉蒸虾',
    subtitle: '鲜甜弹牙 夏至开胃',
    coverImage: img('steamed shrimp with garlic, Chinese seafood dish, food photography'),
    images: [
      img('garlic steamed shrimp on plate, Chinese seafood dish'),
      img('fresh shrimp on ice, seafood ingredient'),
      img('mincing garlic for steamed shrimp, preparation'),
    ],
    solarTerm: '夏至',
    season: 'summer',
    difficulty: 'easy',
    cookTime: '20分钟',
    servings: 3,
    calories: 220,
    description: '夏至时节天气炎热，油腻的食物让人没有胃口。蒜蓉蒸虾做法简单，保留了虾的原汁原味，蒜香浓郁，虾肉鲜甜弹牙，是夏季开胃的不二之选。',
    healthBenefits: ['补肾壮阳', '开胃健脾', '补充蛋白质'],
    ingredients: makeIngredients([
      { productId: 11, quantity: '500g' },
      { productId: 18, quantity: '适量' },
    ]),
    steps: [
      { order: 1, description: '鲜虾剪去虾须，开背去除虾线，洗净摆盘', image: img('preparing shrimp, deveining and cutting') },
      { order: 2, description: '大蒜切末，加生抽、蚝油、少许糖调成蒜蓉汁', image: img('mixing garlic sauce, preparation') },
      { order: 3, description: '将蒜蓉汁淋在虾上，放入蒸锅', image: img('pouring garlic sauce over shrimp') },
      { order: 4, description: '水开后蒸8分钟，出锅后淋上热油激发香味', image: img('steamed garlic shrimp, finished dish') },
    ],
    tips: ['虾要新鲜，蒸出来才鲜甜', '开背后更容易入味', '淋热油是关键，香气立刻出来'],
    tags: ['海鲜', '快手菜', '夏至'],
    rating: 4.9,
    viewCount: 16780,
  },
  {
    id: 12,
    name: '银耳百合莲子羹',
    subtitle: '滋阴润肺 白露养生',
    coverImage: img('snow fungus soup with lily bulb and lotus seed, Chinese dessert, food photography'),
    images: [
      img('snow fungus lotus seed soup in bowl, Chinese dessert, healthy food'),
      img('snow fungus, lily bulb, lotus seeds, Chinese ingredients'),
      img('cooking snow fungus soup, Chinese home cooking'),
    ],
    solarTerm: '白露',
    season: 'autumn',
    difficulty: 'easy',
    cookTime: '60分钟',
    servings: 4,
    calories: 110,
    description: '白露时节，天气干燥，银耳百合莲子羹是最佳的滋阴润肺甜品。银耳富含胶质，百合润肺止咳，莲子养心安神，三者搭配，是秋季润燥的不二之选。',
    healthBenefits: ['滋阴润肺', '养心安神', '美容养颜'],
    ingredients: makeIngredients([
      { productId: 13, quantity: '50g' },
    ]),
    steps: [
      { order: 1, description: '银耳提前泡发2小时，撕成小朵', image: img('soaking snow fungus, preparation') },
      { order: 2, description: '莲子去芯，百合洗净备用', image: img('preparing lotus seeds and lily bulb') },
      { order: 3, description: '将所有食材放入砂锅，加足量清水', image: img('putting ingredients into pot') },
      { order: 4, description: '大火烧开后转小火炖1小时，至银耳浓稠出胶', image: img('slow cooking snow fungus soup') },
      { order: 5, description: '加冰糖调味即可，冷热皆宜', image: img('snow fungus soup, Chinese dessert') },
    ],
    tips: ['银耳要泡发充分才容易出胶', '小火慢炖1小时以上口感最好', '可以加红枣增加风味'],
    tags: ['甜品', '润燥', '白露'],
    rating: 4.8,
    viewCount: 19850,
  },
]

export function getRecipesBySolarTerm(solarTermName: string): Recipe[] {
  return recipes.filter((r) => r.solarTerm === solarTermName)
}

export function getRecipeById(id: number): Recipe | undefined {
  return recipes.find((r) => r.id === id)
}

export function getCurrentTermRecipes(): Recipe[] {
  const currentTerm = getCurrentSolarTerm()
  return getRecipesBySolarTerm(currentTerm.name)
}

export function getSeasonalRecipeData(): Promise<SeasonalRecipeData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        currentSolarTerm: getCurrentSolarTerm(),
        solarTerms,
        recipes,
      })
    }, 300)
  })
}

export function getRecipesBySeason(season: 'spring' | 'summer' | 'autumn' | 'winter'): Recipe[] {
  return recipes.filter((r) => r.season === season)
}
