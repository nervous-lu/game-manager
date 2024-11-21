<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'Home',
  setup() {
    const router = useRouter()
    
    return {
      router
    }
  }
})
</script>

<template>
  <div class="page-container home">
    <h1>小游戏中心</h1>
    <div class="game-list">
      <div class="game-card" @click="router.push('/undercover')">
        <div class="game-icon">🕵️</div>
        <div class="game-info">
          <h2>谁是卧底</h2>
          <p>经典的语言推理游戏</p>
        </div>
      </div>
      <div class="game-card" @click="router.push('/gobang')">
        <div class="game-icon">⚫</div>
        <div class="game-info">
          <h2>五子棋</h2>
          <p>双人对战的策略游戏</p>
        </div>
      </div>
      <div class="game-card" @click="router.push('/minesweeper')">
        <div class="game-icon">💣</div>
        <div class="game-info">
          <h2>扫雷</h2>
          <p>经典的数字推理游戏</p>
        </div>
      </div>
      <div class="game-card" @click="router.push('/puzzle')">
        <div class="game-icon">🔢</div>
        <div class="game-info">
          <h2>数字华容道</h2>
          <p>考验智力的益智游戏</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  padding: 20px;

  h1 {
    text-align: center;
    margin-bottom: 32px;
    color: var(--primary-color);
  }

  .game-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;

    .game-card {
      background: white;
      border-radius: var(--border-radius);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: var(--card-shadow);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }

      &:active {
        transform: scale(0.98);
      }

      .game-icon {
        font-size: 36px;
      }

      .game-info {
        flex: 1;

        h2 {
          margin: 0 0 8px;
          color: var(--text-color);
        }

        p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
}
</style> 