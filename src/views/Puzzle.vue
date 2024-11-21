<template>
  <div class="page-container puzzle">
    <div class="header">
      <van-icon name="arrow-left" @click="handleBack" />
      <h1>数字华容道</h1>
    </div>

    <div class="game-controls">
      <div class="size-selector">
        <div class="section-title">
          <span class="icon">🔢</span>
          <span>选择尺寸</span>
        </div>
        <van-radio-group v-model="currentSize" @change="handleSizeChange">
          <div class="options-grid">
            <div
              v-for="size in [3, 4, 5]"
              :key="size"
              class="option-item"
              :class="{ active: currentSize === size }"
              @click="currentSize = size"
            >
              <div class="count">{{ size }} x {{ size }}</div>
              <div class="check-icon" v-if="currentSize === size">
                <van-icon name="success" />
              </div>
            </div>
          </div>
        </van-radio-group>
      </div>

      <div class="game-info">
        <div class="info-item">
          <van-icon name="clock-o" />
          <span>{{ formatTime(time) }}</span>
        </div>
        <div class="info-item">
          <van-icon name="arrow-left" />
          <span>{{ store.moves }} 步</span>
        </div>
      </div>

      <van-button 
        type="primary" 
        block 
        @click="startGame"
        size="large"
      >
        {{ store.gameStatus === 'playing' ? '重新开始' : '开始游戏' }}
        <template #icon>
          <van-icon :name="store.gameStatus === 'playing' ? 'replay' : 'play-circle-o'" />
        </template>
      </van-button>
    </div>

    <div v-show="store.gameStatus === 'playing'" class="puzzle-board" :style="{ '--board-size': store.size }">
      <div v-for="(row, rowIndex) in computedBoard" :key="rowIndex" class="board-row">
        <div v-for="(cell, colIndex) in row" :key="colIndex" class="board-cell">
          <div
            class="tile"
            :class="{ empty: cell === 0 }"
            @click="handleMove(rowIndex, colIndex)"
          >
            {{ cell || '' }}
          </div>
        </div>
      </div>
    </div>

    <van-dialog
      v-model:show="showSuccess"
      title="恭喜完成！"
      message="你已成功还原所有数字！"
      theme="round-button"
      confirmButtonText="再来一局"
      :showCancelButton="false"
      @confirm="startGame"
    >
      <div class="result-info">
        <div class="result-icon">🎮</div>
        <div class="stats">
          <div class="time">用时：{{ formatTime(time) }}</div>
          <div class="moves">总步数：{{ store.moves }} 步</div>
          <div class="size">难度：{{ store.size }} x {{ store.size }}</div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePuzzleStore } from '@/stores/puzzle'
import { showDialog } from 'vant'
import { useDebounceFn } from '@vueuse/core'

const router = useRouter()
const store = usePuzzleStore()
const showSuccess = ref(false)
const time = ref(0)
const currentSize = ref(3)
let timer: ReturnType<typeof setInterval> | null = null

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const handleSizeChange = (size: number) => {
  currentSize.value = size
  store.setSize(size)
  if (store.gameStatus === 'playing') {
    startGame()
  }
}

const startTimer = () => {
  if (timer) return
  const startTime = Date.now() - time.value * 1000
  timer = setInterval(() => {
    time.value = Math.floor((Date.now() - startTime) / 1000)
  }, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const startGame = () => {
  stopTimer()
  store.initBoard()
  time.value = 0
  startTimer()
}

const handleMove = useDebounceFn((row: number, col: number) => {
  if (store.move(row, col)) {
    if (store.isSolved) {
      stopTimer()
      showSuccess.value = true
    }
  }
}, 100)

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
      stopTimer()
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

const computedBoard = computed(() => {
  return store.board
})

onMounted(() => {
  store.resetGame()
  currentSize.value = store.size
})

onUnmounted(() => {
  stopTimer()
  store.resetGame()
})

watch(() => router.currentRoute.value.path, (newPath: string) => {
  if (newPath !== '/puzzle') {
    stopTimer()
    store.resetGame()
  }
})
</script>

<style lang="scss" scoped>
.puzzle {
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

    .size-selector {
      margin-bottom: 16px;
      background: white;
      border-radius: var(--border-radius);
      padding: 16px;
      box-shadow: var(--card-shadow);

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: bold;
        
        .icon {
          font-size: 24px;
        }
      }

      .options-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;

        .option-item {
          position: relative;
          background: white;
          border: 2px solid #eee;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          &:active {
            transform: scale(0.98);
          }

          &.active {
            border-color: var(--primary-color);
            background: linear-gradient(145deg, var(--primary-color), #5c9ee5);
            color: white;
            transform: scale(1.05);

            .check-icon {
              position: absolute;
              top: -8px;
              right: -8px;
              width: 24px;
              height: 24px;
              background: var(--success-color);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              animation: scaleIn 0.3s ease;
            }
          }

          .count {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 4px;
          }
        }
      }
    }

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
        align-items: center;
        gap: 8px;
        font-size: 18px;
        color: var(--primary-color);

        .van-icon {
          font-size: 24px;
        }
      }
    }
  }

  .puzzle-board {
    display: grid;
    grid-template-columns: repeat(var(--board-size), 1fr);
    gap: 4px;
    padding: 16px;
    background: #f0f0f0;
    border-radius: 12px;
    box-shadow: var(--card-shadow);
    width: 100%;
    max-width: 400px;
    aspect-ratio: 1;
    margin: 0 auto;

    .board-row {
      display: contents;
    }

    .board-cell {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .tile {
      aspect-ratio: 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 8px;
      font-size: 24px;
      font-weight: bold;
      color: var(--primary-color);
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:not(.empty):hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &:not(.empty):active {
        transform: scale(0.95);
      }

      &.empty {
        background: transparent;
        box-shadow: none;
        cursor: default;
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

  @keyframes bounceIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
}
</style> 