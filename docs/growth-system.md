# 成长系统设计文档 (Growth System Design)

## 1. 等级系统设计 (Level System)

### 1.1 经验值获取机制

| 行为 | 经验值 | 说明 |
|------|--------|------|
| 答对基础题 | 10 EXP | 适合当前年级的基础题目 |
| 答对进阶题 | 20 EXP | 稍有难度的进阶题目 |
| 答对挑战题 | 35 EXP | 高难度挑战题目 |
| 连续答对5题 | +15 EXP | 连击奖励 |
| 连续答对10题 | +35 EXP | 更高连击奖励 |
| 完成每日任务 | 50 EXP | 每日学习任务完成 |
| 首次通关章节 | 100 EXP | 新章节首次通关奖励 |

### 1.2 等级划分

```typescript
interface LevelConfig {
  level: number;
  requiredExp: number;
  title: string;           // 称号
  unlocks: string[];       // 解锁内容
}

const LEVEL_CONFIG: LevelConfig[] = [
  { level: 1,  requiredExp: 0,     title: "数学新手",      unlocks: ["新手村地图"] },
  { level: 2,  requiredExp: 100,   title: "算术学徒",      unlocks: ["木剑", "布甲"] },
  { level: 3,  requiredExp: 250,   title: "计算达人",      unlocks: ["森林地图"] },
  { level: 4,  requiredExp: 450,   title: "数学小能手",    unlocks: ["铁剑", "皮甲"] },
  { level: 5,  requiredExp: 700,   title: "运算专家",      unlocks: ["沙漠地图"] },
  { level: 6,  requiredExp: 1000,  title: "数学勇士",      unlocks: ["银剑", "锁甲"] },
  { level: 7,  requiredExp: 1400,  title: "计算大师",      unlocks: ["雪山地图"] },
  { level: 8,  requiredExp: 1900,  title: "数学精英",      unlocks: ["金剑", "板甲"] },
  { level: 9,  requiredExp: 2500,  title: "运算宗师",      unlocks: ["火山地图"] },
  { level: 10, requiredExp: 3200,  title: "数学传奇",      unlocks: ["传说武器", "龙甲"] },
  // 最高等级，更多内容可后续扩展
];
```

### 1.3 等级奖励原则

- **教育导向**: 等级提升需通过学习行为获得，不可付费加速
- **适度挑战**: 升级难度递增，但保持孩子能感受到进步
- **正向激励**: 每次升级都有视觉/音效反馈
- **内容解锁**: 等级解锁新地图/装备，激发探索欲望

---

## 2. 装备系统设计 (Equipment System)

### 2.1 装备类型

```typescript
type EquipmentSlot = 'weapon' | 'helmet' | 'armor' | 'accessory';

interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  levelRequired: number;
  price: number;           // 金币价格
  visualEffect: string;     // 视觉效果描述
  description: string;      // 装备描述
}
```

### 2.2 武器系列 (Weapons)

| ID | 名称 | 稀有度 | 等级要求 | 价格 | 视觉效果 |
|----|------|--------|----------|------|----------|
| w001 | 木剑 | 普通 | 2 | 50 | 简朴的木制练习剑 |
| w002 | 铁剑 | 普通 | 4 | 150 | 闪亮的铁制短剑 |
| w003 | 银剑 | 稀有 | 6 | 400 | 银光闪闪的长剑 |
| w004 | 金剑 | 史诗 | 8 | 800 | 金光灿灿的宝剑 |
| w005 | 彩虹剑 | 传说 | 10 | 2000 | 七彩光芒的神剑 |
| w006 | 算术杖 | 普通 | 2 | 60 | 刻着数字的法杖 |
| w007 | 智慧杖 | 稀有 | 5 | 350 | 顶端镶嵌宝石 |
| w008 | 数学神杖 | 传说 | 10 | 2500 | 散发知识之光 |

### 2.3 头盔系列 (Helmets)

| ID | 名称 | 稀有度 | 等级要求 | 价格 | 视觉效果 |
|----|------|--------|----------|------|----------|
| h001 | 学士帽 | 普通 | 1 | 30 | 可爱的毕业帽造型 |
| h002 | 冒险者帽 | 普通 | 3 | 80 | 经典冒险家帽子 |
| h003 | 骑士头盔 | 稀有 | 5 | 300 | 银色骑士头盔 |
| h004 | 王冠 | 史诗 | 8 | 700 | 金色小王冠 |
| h005 | 龙角头盔 | 传说 | 10 | 1800 | 带龙角的酷炫头盔 |

### 2.4 护甲系列 (Armor)

| ID | 名称 | 稀有度 | 等级要求 | 价格 | 视觉效果 |
|----|------|--------|----------|------|----------|
| a001 | 布甲 | 普通 | 2 | 40 | 轻便的学习者布甲 |
| a002 | 皮甲 | 普通 | 4 | 120 | 结实的皮革护甲 |
| a003 | 锁甲 | 稀有 | 6 | 350 | 闪亮的锁子甲 |
| a004 | 板甲 | 史诗 | 8 | 750 | 厚重的骑士板甲 |
| a005 | 龙鳞甲 | 传说 | 10 | 2200 | 金色龙鳞制成的神甲 |
| a006 | 数学斗篷 | 普通 | 1 | 25 | 印有数字图案的斗篷 |
| a007 | 智者长袍 | 稀有 | 5 | 280 | 绣着公式图案的法师袍 |

### 2.5 装备设计原则

- **纯视觉属性**: 装备仅影响角色外观，不影响游戏数值
- **无付费优势**: 所有装备均可通过游戏内金币购买
- **教育主题命名**: 装备名称与数学/学习主题关联
- **收集乐趣**: 鼓励收集而非攀比，稀有度仅影响外观炫酷程度

---

## 3. 金币与商城系统 (Gold & Shop System)

### 3.1 金币获取方式

| 行为 | 金币奖励 | 限制 |
|------|----------|------|
| 答对题目 | 1-5 金币 | 根据题目难度 |
| 每日登录 | 10 金币 | 每日一次 |
| 完成章节 | 50-100 金币 | 根据章节难度 |
| 成就奖励 | 20-200 金币 | 一次性奖励 |
| 连续学习7天 | 100 金币 | 每周一次 |

### 3.2 金币用途

- **购买装备**: 商城购买各类装备
- **购买皮肤**: 角色皮肤/特效
- **解锁地图**: 部分地图需要金币解锁
- **道具购买**: 学习辅助道具(如提示卡)

### 3.3 商城结构设计

```typescript
interface ShopItem {
  id: string;
  type: 'equipment' | 'skin' | 'prop';
  item: Equipment | Skin | Prop;
  price: number;
  discount?: number;       // 折扣
  isNew?: boolean;         // 新品标识
  isHot?: boolean;         // 热门标识
}

interface ShopCategory {
  id: string;
  name: string;
  icon: string;
  items: ShopItem[];
}

const SHOP_CATEGORIES: ShopCategory[] = [
  { id: 'weapons', name: '武器', icon: 'sword', items: [] },
  { id: 'helmets', name: '头盔', icon: 'helmet', items: [] },
  { id: 'armors', name: '护甲', icon: 'shield', items: [] },
  { id: 'skins', name: '皮肤', icon: 'star', items: [] },
  { id: 'props', name: '道具', icon: 'potion', items: [] },
];
```

### 3.4 防沉迷机制

```typescript
interface AntiAddictionConfig {
  dailyGoldCap: number;         // 每日金币上限
  sessionTimeWarning: number;   // 单次游戏时长警告(分钟)
  dailyTimeCap: number;         // 每日游戏时长上限(分钟)
  rewardDiminishing: boolean;   // 奖励递减机制
}

const ANTI_ADDICTION: AntiAddictionConfig = {
  dailyGoldCap: 200,            // 每日最多获取200金币
  sessionTimeWarning: 30,       // 30分钟提示休息
  dailyTimeCap: 90,             // 每日最多90分钟
  rewardDiminishing: true,      // 超时后奖励减少
};
```

---

## 4. UI 组件规划 (UI Component Architecture)

### 4.1 组件结构图

```
src/components/growth/
├── LevelSystem/
│   ├── LevelBadge.tsx          # 等级徽章显示
│   ├── ExpProgressBar.tsx      # 经验进度条
│   ├── LevelUpModal.tsx        # 升级弹窗
│   └── LevelInfoPanel.tsx      # 等级信息面板
│
├── Equipment/
│   ├── EquipmentSlot.tsx       # 装备槽位组件
│   ├── EquipmentCard.tsx       # 装备卡片
│   ├── EquipmentPreview.tsx    # 装备预览(角色穿戴效果)
│   ├── EquipmentInventory.tsx  # 装备背包
│   └── EquipmentDetails.tsx    # 装备详情弹窗
│
├── Shop/
│   ├── ShopLayout.tsx          # 商城布局
│   ├── ShopCategory.tsx        # 商城分类
│   ├── ShopItem.tsx            # 商品项
│   ├── ShopPreview.tsx         # 购买预览
│   └── PurchaseModal.tsx       # 购买确认弹窗
│
├── Currency/
│   ├── GoldDisplay.tsx         # 金币显示组件
│   ├── GoldAnimation.tsx       # 金币获取动画
│   └── WalletPanel.tsx         # 钱包面板
│
├── Achievement/
│   ├── AchievementBadge.tsx    # 成就徽章
│   ├── AchievementList.tsx      # 成就列表
│   └── AchievementUnlock.tsx   # 成就解锁动画
│
└── shared/
    ├── RarityBadge.tsx         # 稀有度标签
    ├── AnimatedNumber.tsx      # 数字滚动动画
    └── Tooltip.tsx             # 提示组件
```

### 4.2 核心组件接口定义

```typescript
// LevelBadge.tsx
interface LevelBadgeProps {
  level: number;
  title: string;
  size?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
  animated?: boolean;
}

// ExpProgressBar.tsx
interface ExpProgressBarProps {
  currentExp: number;
  requiredExp: number;
  showDetails?: boolean;
  animated?: boolean;
  onLevelUp?: () => void;
}

// EquipmentSlot.tsx
interface EquipmentSlotProps {
  slot: EquipmentSlot;
  equipment: Equipment | null;
  isEditable?: boolean;
  onEquip?: (equipment: Equipment) => void;
  onUnequip?: () => void;
}

// ShopItem.tsx
interface ShopItemProps {
  item: ShopItem;
  goldBalance: number;
  isOwned: boolean;
  onPurchase: (item: ShopItem) => void;
  onPreview: (item: ShopItem) => void;
}

// GoldDisplay.tsx
interface GoldDisplayProps {
  amount: number;
  showAnimation?: boolean;
  delta?: number;  // 变化量，用于显示+/-动画
}
```

### 4.3 视觉设计规范

```typescript
// 稀有度颜色方案
const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-600',
    glow: 'shadow-gray-200',
  },
  rare: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-600',
    glow: 'shadow-blue-300',
  },
  epic: {
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-600',
    glow: 'shadow-purple-300',
  },
  legendary: {
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-600',
    glow: 'shadow-amber-300 animate-pulse',
  },
};

// 等级颜色渐变
const LEVEL_COLORS = {
  1: 'from-green-400 to-green-600',
  2: 'from-green-500 to-emerald-600',
  3: 'from-emerald-500 to-teal-600',
  4: 'from-teal-500 to-cyan-600',
  5: 'from-cyan-500 to-blue-600',
  6: 'from-blue-500 to-indigo-600',
  7: 'from-indigo-500 to-violet-600',
  8: 'from-violet-500 to-purple-600',
  9: 'from-purple-500 to-pink-600',
  10: 'from-pink-500 to-rose-600',
};
```

---

## 5. 状态管理方案 (State Management)

### 5.1 状态结构设计

```typescript
// src/store/growthSlice.ts
interface GrowthState {
  // 等级系统
  level: number;
  currentExp: number;
  totalExp: number;
  title: string;

  // 装备系统
  equippedItems: {
    weapon: Equipment | null;
    helmet: Equipment | null;
    armor: Equipment | null;
    accessory: Equipment | null;
  };
  inventory: Equipment[];

  // 金币系统
  gold: number;
  totalGoldEarned: number;
  dailyGoldEarned: number;
  lastGoldResetDate: string;

  // 商城状态
  purchasedItems: string[];
  shopItems: ShopItem[];

  // 成就系统
  achievements: Achievement[];
  unlockedAchievements: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'level' | 'questions' | 'streak' | 'accuracy';
    value: number;
  };
  reward: {
    gold: number;
    title?: string;
  };
}
```

### 5.2 Redux Toolkit Slice 示例

```typescript
// src/store/growthSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const growthSlice = createSlice({
  name: 'growth',
  initialState: initialGrowthState,
  reducers: {
    // 经验值相关
    addExperience: (state, action: PayloadAction<number>) => {
      state.currentExp += action.payload;
      state.totalExp += action.payload;

      // 检查升级
      while (state.currentExp >= getRequiredExp(state.level)) {
        state.currentExp -= getRequiredExp(state.level);
        state.level++;
        state.title = getTitleForLevel(state.level);
        // 触发升级效果...
      }
    },

    // 装备相关
    equipItem: (state, action: PayloadAction<Equipment>) => {
      const item = action.payload;
      state.equippedItems[item.slot] = item;
    },

    unequipItem: (state, action: PayloadAction<EquipmentSlot>) => {
      state.equippedItems[action.payload] = null;
    },

    addToInventory: (state, action: PayloadAction<Equipment>) => {
      state.inventory.push(action.payload);
    },

    // 金币相关
    addGold: (state, action: PayloadAction<number>) => {
      // 检查每日上限
      if (state.dailyGoldEarned + action.payload <= DAILY_GOLD_CAP) {
        state.gold += action.payload;
        state.totalGoldEarned += action.payload;
        state.dailyGoldEarned += action.payload;
      }
    },

    spendGold: (state, action: PayloadAction<number>) => {
      if (state.gold >= action.payload) {
        state.gold -= action.payload;
      }
    },

    purchaseItem: (state, action: PayloadAction<ShopItem>) => {
      const item = action.payload;
      if (state.gold >= item.price && !state.purchasedItems.includes(item.id)) {
        state.gold -= item.price;
        state.purchasedItems.push(item.id);
        // 添加到背包
        if (item.type === 'equipment') {
          state.inventory.push(item.item as Equipment);
        }
      }
    },

    // 成就相关
    unlockAchievement: (state, action: PayloadAction<string>) => {
      if (!state.unlockedAchievements.includes(action.payload)) {
        state.unlockedAchievements.push(action.payload);
        const achievement = state.achievements.find(a => a.id === action.payload);
        if (achievement) {
          state.gold += achievement.reward.gold;
        }
      }
    },
  },
});
```

### 5.3 选择器(Selectors)

```typescript
// src/store/growthSelectors.ts
export const selectLevel = (state: RootState) => state.growth.level;
export const selectCurrentExp = (state: RootState) => state.growth.currentExp;
export const selectGold = (state: RootState) => state.growth.gold;

export const selectExpProgress = createSelector(
  [selectCurrentExp, selectLevel],
  (currentExp, level) => {
    const required = getRequiredExp(level);
    return (currentExp / required) * 100;
  }
);

export const selectEquippedItems = (state: RootState) => state.growth.equippedItems;

export const selectInventoryBySlot = (slot: EquipmentSlot) =>
  createSelector(
    [(state: RootState) => state.growth.inventory],
    (inventory) => inventory.filter(item => item.slot === slot)
  );

export const selectCanAfford = (price: number) =>
  createSelector(
    [selectGold],
    (gold) => gold >= price
  );
```

### 5.4 数据持久化

```typescript
// src/utils/storage.ts
import { GrowthState } from '../store/growthSlice';

const STORAGE_KEY = 'mathgame_growth_data';

export const saveGrowthData = (state: GrowthState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadGrowthData = (): GrowthState | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearGrowthData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// 自动保存中间件
export const growthPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  saveGrowthData(state.growth);
  return result;
};
```

---

## 6. 动画与交互设计

### 6.1 关键动画效果

```typescript
// 经验值获取动画
const expGainAnimation = {
  duration: 800,
  easing: 'ease-out',
  keyframes: [
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(1.2)', opacity: 0.8 },
    { transform: 'scale(1)', opacity: 1 },
  ],
};

// 升级动画
const levelUpAnimation = {
  duration: 2000,
  stages: [
    { stage: 'flash', duration: 300 },      // 闪光效果
    { stage: 'expand', duration: 500 },     // 放大展开
    { stage: 'confetti', duration: 1000 },  // 五彩纸屑
    { stage: 'settle', duration: 200 },     // 落定
  ],
};

// 金币获取动画
const goldGainAnimation = {
  duration: 600,
  trajectory: 'arc',  // 抛物线轨迹
  easing: 'ease-out',
};

// 装备穿戴动画
const equipAnimation = {
  duration: 400,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};
```

### 6.2 音效设计

| 事件 | 音效类型 | 说明 |
|------|----------|------|
| 获得经验 | 轻快提示音 | 短促、清脆 |
| 升级 | 欢快音乐 | 3-5秒庆祝音效 |
| 获得金币 | 金币碰撞声 | 清脆金属音 |
| 装备穿戴 | 装备声 | 根据装备类型变化 |
| 购买成功 | 商店铃声 | 愉悦确认音 |
| 成就解锁 | 号角声 | 荣耀感音效 |

---

## 7. 集成要点

### 7.1 与答题系统集成

```typescript
// 答题正确后触发奖励
const handleCorrectAnswer = (question: Question) => {
  const expReward = calculateExpReward(question);
  const goldReward = calculateGoldReward(question);

  dispatch(addExperience(expReward));
  dispatch(addGold(goldReward));

  // 检查连击奖励
  if (streakCount >= 5) {
    dispatch(addExperience(STREAK_BONUS[streakCount] || 35));
  }

  // 检查成就
  checkAchievements(state);
};
```

### 7.2 与地图系统集成

```typescript
// 检查地图解锁
const canAccessMap = (mapId: string, userLevel: number) => {
  const map = MAP_CONFIG[mapId];
  return userLevel >= map.requiredLevel;
};
```

### 7.3 与角色系统集成

```typescript
// 获取角色当前外观
const getCharacterAppearance = (state: RootState) => {
  const equipped = state.growth.equippedItems;
  return {
    weapon: equipped.weapon?.visualEffect || 'default',
    helmet: equipped.helmet?.visualEffect || 'default',
    armor: equipped.armor?.visualEffect || 'default',
  };
};
```

---

## 8. 后续扩展规划

### Phase 2 功能
- [ ] 好友系统(展示装备)
- [ ] 装备强化系统(视觉升级)
- [ ] 限时活动装备
- [ ] 赛季奖励系统

### Phase 3 功能
- [ ] 装备合成系统
- [ ] 自定义装备染色
- [ ] 宠物系统
- [ ] 家园装饰系统

---

## 文档版本
- v1.0 - 初始设计 (2026-03-05)
- 作者: Frontend Developer
- 审核: 待 Architect 审核