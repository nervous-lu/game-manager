<template>
  <div class="page-container game2048">
    <div class="header">
      <van-icon name="arrow-left" @click="handleBack" />
      <h1>2048</h1>
    </div>

    <div class="game-controls">
      <div class="game-info">
        <div class="info-item">
          <span class="label">分数</span>
          <span class="value">{{ store.score }}</span>
        </div>
        <div class="info-item">
          <span class="label">最高分</span>
          <span class="value">{{ store.bestScore }}</span>
        </div>
      </div>

      <van-button 
        type="primary" 
        block 
        @click="store.initBoard"
        size="large"
      >
        {{ store.gameStatus === 'playing' ? '重新开始' : '开始游戏' }}
        <template #icon>
          <van-icon :name="store.gameStatus === 'playing' ? 'replay' : 'play-circle-o'" />
        </template>
      </van-button>
    </div>

    <div class="board-container">
      <div class="board">
        <div v-for="(row, rowIndex) in store.board" :key="rowIndex" class="board-row">
          <div 
            v-for="(cell, colIndex) in row" 
            :key="colIndex" 
            class="cell"
            :class="`n${cell}`"
          >
            {{ cell || '' }}
          </div>
        </div>
      </div>
    </div>

    <van-dialog
      v-model:show="showResult"
      :title="store.gameStatus === 'won' ? '恭喜达成2048！' : '游戏结束'"
      :message="store.gameStatus === 'won' ? '你已成功合成2048！' : '无法继续移动了！'"
      theme="round-button"
      confirmButtonText="再来一局"
      :showCancelButton="false"
      @confirm="store.initBoard"
    >
      <div class="result-info">
        <div class="result-icon">🎮</div>
        <div class="stats">
          <div class="score">得分：{{ store.score }}</div>
          <div class="best-score">最高分：{{ store.bestScore }}</div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGame2048Store } from '@/stores/game2048'
import { showDialog } from 'vant'

const router = useRouter()
const store = useGame2048Store()
const showResult = ref(false)

// 触摸相关变量
let touchStartX = 0
let touchStartY = 0
const MIN_SWIPE_DISTANCE = 30

const handleBack = async () => {
  if (store.gameStatus === 'playing') {
    try {
      await showDialog({
        title: '确认退出',
        message: '当前游戏进度将丢失，确定要退出吗？',
        confirmButtonText: '确认退出',
        cancelButtonText: '继续游戏',
        theme: 'round-button'
      })
      store.resetGame()
      router.push('/')
    } catch {
      // 用户取消，继续游戏
    }
  } else {
    store.resetGame()
    router.push('/')
  }
}

// 键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  if (store.gameStatus !== 'playing') return

  switch (e.key) {
    case 'ArrowUp':
      store.move('up')
      break
    case 'ArrowDown':
      store.move('down')
      break
    case 'ArrowLeft':
      store.move('left')
      break
    case 'ArrowRight':
      store.move('right')
      break
  }

  if (store.gameStatus === 'won' || store.gameStatus === 'lost') {
    showResult.value = true
  }
}

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const handleTouchEnd = (e: TouchEvent) => {
  if (store.gameStatus !== 'playing') return

  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  
  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY
  
  if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE && Math.abs(deltaY) < MIN_SWIPE_DISTANCE) {
    return
  }
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      store.move('right')
    } else {
      store.move('left')
    }
  } else {
    if (deltaY > 0) {
      store.move('down')
    } else {
      store.move('up')
    }
  }

  if (store.gameStatus === 'won' || store.gameStatus === 'lost') {
    showResult.value = true
  }
}

onMounted(() => {
  store.resetGame()
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('touchstart', handleTouchStart)
  document.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
  store.resetGame()
})

// 路由守卫
watch(() => router.currentRoute.value.path, (newPath: string) => {
  if (newPath !== '/game2048') {
    store.resetGame()
  }
})
</script>

<style lang="scss" scoped>
.game2048 {
  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;

    .van-icon {
      font-size: 24px;
      cursor: pointer;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .game-controls {
    margin-bottom: 24px;

    .game-info {
      display: flex;
      justify-content: space-around;
      margin-bottom: 16px;
      padding: 12px;
      background: white;
      border-radius: 12px;
      box-shadow: var(--card-shadow);

      .info-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .label {
          font-size: 14px;
          color: #666;
        }

        .value {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary-color);
        }
      }
    }
  }

  .board-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;

    .board {
      display: grid;
      gap: 8px;
      background: #bbada0;
      padding: 8px;
      border-radius: 8px;
      box-shadow: var(--card-shadow);

      .board-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }

      .cell {
        width: 70px;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        background: #cdc1b4;
        border-radius: 4px;
        transition: all 0.15s ease;

        &.n2 { background: #eee4da; }
        &.n4 { background: #ede0c8; }
        &.n8 { background: #f2b179; color: white; }
        &.n16 { background: #f59563; color: white; }
        &.n32 { background: #f67c5f; color: white; }
        &.n64 { background: #f65e3b; color: white; }
        &.n128 { background: #edcf72; color: white; font-size: 20px; }
        &.n256 { background: #edcc61; color: white; font-size: 20px; }
        &.n512 { background: #edc850; color: white; font-size: 20px; }
        &.n1024 { background: #edc53f; color: white; font-size: 18px; }
        &.n2048 { background: #edc22e; color: white; font-size: 18px; }
      }
    }
  }

  .result-info {
    padding: 24px;
    text-align: center;
    
    .result-icon {
      font-size: 48px;
      margin-bottom: 16px;
      animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      > div {
        color: var(--text-color);
        font-size: 16px;
      }
    }
  }
}

@media (max-width: 768px) {
  .game2048 {
    .board-container {
      .board {
        .cell {
          width: calc(90vw / 4 - 12px);
          height: calc(90vw / 4 - 12px);
          font-size: 20px;

          &.n128, &.n256, &.n512 { font-size: 18px; }
          &.n1024, &.n2048 { font-size: 16px; }
        }
      }
    }
  }
}
</style> 