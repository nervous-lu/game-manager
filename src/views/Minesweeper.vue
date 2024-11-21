<template>
  <div class="page-container minesweeper">
    <div class="header">
      <van-icon name="arrow-left" @click="handleBack" />
      <h1>扫雷</h1>
    </div>

    <div class="game-controls">
      <div class="difficulty-selector">
        <div class="section-title">
          <span class="icon">🎯</span>
          <span>选择难度</span>
        </div>
        <van-radio-group v-model="store.difficulty" direction="horizontal">
          <div class="difficulty-options">
            <div
              v-for="level in ['easy', 'medium', 'hard']"
              :key="level"
              :class="['difficulty-option', { active: store.difficulty === level }]"
              @click="setDifficulty(level)"
            >
              <div class="icon">
                {{ getDifficultyIcon(level) }}
              </div>
              <div class="label">{{ getDifficultyLabel(level) }}</div>
              <div class="desc">{{ getDifficultyDesc(level) }}</div>
            </div>
          </div>
        </van-radio-group>
      </div>

      <div class="game-info">
        <div class="info-item">
          <van-icon name="flag-o" />
          <span>{{ store.remainingMines }}</span>
        </div>
        <div class="info-item">
          <van-icon name="clock-o" />
          <span>{{ formatTime(timeElapsed) }}</span>
        </div>
      </div>

      <van-button 
        type="primary" 
        block 
        @click="store.resetGame"
        size="large"
      >
        {{ store.gameStatus === 'playing' ? '重新开始' : '开始游戏' }}
        <template #icon>
          <van-icon :name="store.gameStatus === 'playing' ? 'replay' : 'play-circle-o'" />
        </template>
      </van-button>
    </div>

    <div class="board-container" :class="store.difficulty">
      <div 
        class="board"
        :style="{
          gridTemplateRows: `repeat(${store.boardSize.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${store.boardSize.cols}, 1fr)`
        }"
        @contextmenu.prevent
        @touchstart.prevent="handleTouchStart"
        @touchend.prevent="handleTouchEnd"
      >
        <div
          v-for="(row, rowIndex) in store.board"
          :key="rowIndex"
          class="board-row"
        >
          <div
            v-for="(cell, colIndex) in row"
            :key="`${rowIndex}-${colIndex}`"
            class="cell"
            :class="[
              cell.status,
              {
                'mine': cell.isMine && cell.isRevealed,
                [`n${cell.neighborMines}`]: cell.isRevealed && !cell.isMine,
                'hover': !cell.isRevealed && !cell.isFlagged && store.gameStatus === 'playing'
              }
            ]"
            @click="handleCellClick(rowIndex, colIndex)"
            @contextmenu="handleCellRightClick(rowIndex, colIndex)"
          >
            <template v-if="cell.isFlagged">
              <span class="flag">🚩</span>
            </template>
            <template v-else-if="cell.isRevealed && cell.isMine">
              <span class="mine">💣</span>
            </template>
            <template v-else-if="cell.isRevealed && cell.neighborMines > 0">
              {{ cell.neighborMines }}
            </template>
          </div>
        </div>
      </div>
    </div>

    <van-dialog
      v-model:show="showResult"
      :title="store.gameStatus === 'won' ? '恭喜胜利！' : '游戏结束'"
      :message="store.gameStatus === 'won' ? '你成功找出了所有地雷！' : '很遗憾，踩到地雷了！'"
      theme="round-button"
      confirmButtonText="再来一局"
      :showCancelButton="false"
      @confirm="store.resetGame"
    >
      <div class="result-info">
        <div class="result-icon">
          {{ store.gameStatus === 'won' ? '🎯' : '💣' }}
        </div>
        <div class="stats">
          <div class="time">用时：{{ formatTime(timeElapsed) }}</div>
          <div class="difficulty">难度：{{ getDifficultyLabel(store.difficulty) }}</div>
          <div class="mines">剩余地雷：{{ store.remainingMines }}</div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMinesweeperStore } from '@/stores/minesweeper'
import { showDialog } from 'vant'

const router = useRouter()
const store = useMinesweeperStore()
const showResult = ref(false)
const timeElapsed = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// 长按相关变量
let touchTimer: ReturnType<typeof setTimeout> | null = null
let touchStartTime = 0
const LONG_PRESS_DURATION = 500 // 长按时间阈值（毫秒）
let touchedCell: { row: number; col: number } | null = null

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const handleTouchStart = (e: TouchEvent) => {
  if (store.gameStatus !== 'playing') return
  
  const touch = e.touches[0]
  const board = e.currentTarget as HTMLElement
  const rect = board.getBoundingClientRect()
  
  const cellWidth = rect.width / store.boardSize.cols
  const cellHeight = rect.height / store.boardSize.rows
  
  const col = Math.floor((touch.clientX - rect.left) / cellWidth)
  const row = Math.floor((touch.clientY - rect.top) / cellHeight)
  
  if (row >= 0 && row < store.boardSize.rows && col >= 0 && col < store.boardSize.cols) {
    touchedCell = { row, col }
    touchStartTime = Date.now()
    
    touchTimer = setTimeout(() => {
      if (touchedCell) {
        handleCellRightClick(touchedCell.row, touchedCell.col)
        touchedCell = null
      }
    }, LONG_PRESS_DURATION)
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  e.preventDefault()
  
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
  
  if (touchedCell && Date.now() - touchStartTime < LONG_PRESS_DURATION) {
    handleCellClick(touchedCell.row, touchedCell.col)
  }
  
  touchedCell = null
}

const handleCellClick = (row: number, col: number) => {
  if (store.gameStatus === 'waiting') {
    store.startGame(row, col)
    startTimer()
  } else if (store.gameStatus === 'playing') {
    store.revealCell(row, col)
    if (store.isGameOver) {
      stopTimer()
      showResult.value = true
    }
  }
}

const handleCellRightClick = (row: number, col: number) => {
  if (store.gameStatus === 'playing') {
    store.toggleFlag(row, col)
  }
}

const startTimer = () => {
  if (timer) return
  const startTime = Date.now() - timeElapsed.value * 1000
  timer = setInterval(() => {
    timeElapsed.value = Math.floor((Date.now() - startTime) / 1000)
  }, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

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

const setDifficulty = (difficulty: string) => {
  store.setDifficulty(difficulty as 'easy' | 'medium' | 'hard')
  stopTimer()
  timeElapsed.value = 0
}

onMounted(() => {
  store.resetGame()
})

onUnmounted(() => {
  stopTimer()
  if (touchTimer) {
    clearTimeout(touchTimer)
  }
  store.resetGame()
})

watch(() => router.currentRoute.value.path, (newPath: string) => {
  if (newPath !== '/minesweeper') {
    stopTimer()
    store.resetGame()
  }
})

// 添加这些辅助函数
const getDifficultyIcon = (level: string) => {
  const icons = {
    easy: '🌟',
    medium: '🌙',
    hard: '⭐'
  }
  return icons[level as keyof typeof icons]
}

const getDifficultyLabel = (level: string) => {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labels[level as keyof typeof labels]
}

const getDifficultyDesc = (level: string) => {
  const descs = {
    easy: '9x9 格子 10 个雷',
    medium: '16x16 格子 40 个雷',
    hard: '30x16 格子 99 个雷'
  }
  return descs[level as keyof typeof descs]
}
</script>

<style lang="scss" scoped>
.minesweeper {
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

    .difficulty-selector {
      margin-bottom: 24px;
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

      .difficulty-options {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        padding: 0 8px;

        .difficulty-option {
          position: relative;
          background: white;
          border: 2px solid #eee;
          border-radius: 12px;
          padding: 16px 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 120px;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          &:active {
            transform: scale(0.98);
          }

          &.active {
            border-color: var(--primary-color);
            background: linear-gradient(145deg, var(--primary-color), #5c9ee5);
            color: white;
            transform: scale(1.05);

            .desc {
              color: rgba(255, 255, 255, 0.8);
            }
          }

          .icon {
            font-size: 32px;
            margin-bottom: 12px;
          }

          .label {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 16px;
          }

          .desc {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
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

  .board-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    padding-bottom: 40px;

    &.easy {
      --cell-size: min(35px, calc(90vw / 9));
    }

    &.medium {
      --cell-size: min(30px, calc(90vw / 16));
    }

    &.hard {
      --cell-size: min(25px, calc(90vw / 30));
    }

    .board {
      display: grid;
      gap: 1px;
      background: #bdbdbd;
      border: 2px solid #7b7b7b;
      padding: 1px;
      touch-action: none;
      user-select: none;
      width: fit-content;
      margin: 0 auto;

      .board-row {
        display: contents;
      }

      .cell {
        width: var(--cell-size);
        height: var(--cell-size);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: calc(var(--cell-size) * 0.6);
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s ease;
        touch-action: none;
        -webkit-tap-highlight-color: transparent;

        &.hidden {
          background: #c0c0c0;
          border-top: 2px solid #fff;
          border-left: 2px solid #fff;
          border-right: 2px solid #7b7b7b;
          border-bottom: 2px solid #7b7b7b;

          &:active {
            background: #bdbdbd;
            border: 1px solid #7b7b7b;
          }
        }

        &.revealed {
          background: #e0e0e0;
          border: 1px solid #bdbdbd;

          &.mine {
            background: #ff4444;
          }

          &.n1 { color: #0000ff; }
          &.n2 { color: #008000; }
          &.n3 { color: #ff0000; }
          &.n4 { color: #000080; }
          &.n5 { color: #800000; }
          &.n6 { color: #008080; }
          &.n7 { color: #000000; }
          &.n8 { color: #808080; }
        }

        &.flagged {
          background: #c0c0c0;
          border-top: 2px solid #fff;
          border-left: 2px solid #fff;
          border-right: 2px solid #7b7b7b;
          border-bottom: 2px solid #7b7b7b;
        }

        &.hover:active {
          background: #b0b0b0;
          border-color: #999;
        }

        .flag, .mine {
          display: inline-block;
          animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        &.revealed {
          animation: reveal 0.3s ease;
        }

        &.n1, &.n2, &.n3, &.n4, &.n5, &.n6, &.n7, &.n8 {
          font-family: 'Consolas', monospace;
          font-weight: bold;
          animation: numberIn 0.3s ease;
        }
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