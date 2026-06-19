# 奖励概率表设计

## 标准掉落表结构

| 物品 | 稀有度 | 概率 |
|------|--------|------|
| 铜币 | 普通 | 50% |
| 铁剑 | 普通 | 30% |
| 银币 | 稀有 | 15% |
| 金剑 | 史诗 | 4.5% |
| 传说宝石 | 传说 | 0.5% |

## 保底机制设计

```pseudo
function getLoot(player):
    pityCounter = player.getPityCounter()
    
    if pityCounter >= 100:
        // 保底触发
        reward = getRandomEpicOrLegendary()
        player.resetPityCounter()
    else:
        reward = rollNormalLootTable()
        if not isEpicOrLegendary(reward):
            player.incrementPityCounter()
    
    return reward
```

## 概率调整公式

**动态概率**：
```
调整后概率 = 基础概率 × (1 + 玩家等级 × 0.02)
```

**递减概率**（防止刷）：
```
当前概率 = 基础概率 × (0.9 ^ 重复次数)
```