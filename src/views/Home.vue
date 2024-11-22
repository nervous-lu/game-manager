<template>
  <div class="page-container home">
    <h1>游戏中心</h1>
    <div class="game-grid">
      <div
        v-for="game in games"
        :key="game.path"
        class="game-card"
        @click="router.push(game.path)"
      >
        <div class="icon">{{ game.icon }}</div>
        <div class="info">
          <div class="name">{{ game.name }}</div>
          <div class="desc">{{ game.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const games = [
  {
    name: '扫雷',
    desc: '经典的扫雷游戏，考验你的逻辑推理能力',
    icon: '💣',
    path: '/minesweeper'
  },
  {
    name: '五子棋',
    desc: '双人对战的五子棋游戏',
    icon: '⭕',
    path: '/gobang'
  },
  {
    name: '谁是卧底',
    desc: '经典的派对游戏，找出隐藏的卧底',
    icon: '🕵️',
    path: '/undercover'
  },
  {
    name: '数字华容道',
    desc: '滑动方块，还原数字顺序',
    icon: '🔢',
    path: '/puzzle'
  },
  {
    name: '2048',
    desc: '合并数字，获得更高分数',
    icon: '🎲',
    path: '/game2048'
  },
  {
    name: '记忆翻牌',
    desc: '考验记忆力的翻牌游戏',
    icon: '🃏',
    path: '/memory'
  },
  {
    name: '跳一跳',
    desc: '考验手速与技巧的跳跃游戏',
    icon: '🏃',
    path: '/jump'
  }
]
</script>

<style lang="scss" scoped>
.home {
  h1 {
    text-align: center;
    margin-bottom: 32px;
    color: var(--primary-color);
  }

  .game-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 0 16px;

    .game-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: var(--card-shadow);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      &:active {
        transform: scale(0.98);
      }

      .icon {
        font-size: 40px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: white;
        border-radius: 12px;
      }

      .info {
        flex: 1;

        .name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
          color: var(--text-color);
        }

        .desc {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .home {
    .game-grid {
      grid-template-columns: 1fr;
      padding: 0;
    }
  }
}
</style>
