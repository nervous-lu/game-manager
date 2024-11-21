<template>
  <div class="page-container gobang">
    <div class="header">
      <van-icon name="arrow-left" @click="handleBack" />
      <h1>五子棋</h1>
    </div>

    <div class="game-controls">
      <div class="player-panel">
        <div class="section-title">
          <span class="icon">👥</span>
          <span>对战信息</span>
        </div>
        
        <div class="players">
          <div :class="['player-card', store.currentPlayer === 1 ? 'active' : '']">
            <div class="player-info">
              <div class="chess black"></div>
              <div class="details">
                <div class="label">黑方</div>
                <div class="time">{{ formatTime(store.blackTime) }}</div>
              </div>
            </div>
            <div class="status" v-if="store.currentPlayer === 1">当前回合</div>
          </div>

          <div class="vs">VS</div>

          <div :class="['player-card', store.currentPlayer === 2 ? 'active' : '']">
            <div class="player-info">
              <div class="chess white"></div>
              <div class="details">
                <div class="label">白方</div>
                <div class="time">{{ formatTime(store.whiteTime) }}</div>
              </div>
            </div>
            <div class="status" v-if="store.currentPlayer === 2">当前回合</div>
          </div>
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

    <div class="board-wrapper">
      <div class="board-container">
        <canvas 
          ref="boardRef"
          :width="boardSize"
          :height="boardSize"
          @click="handleClick"
          @mousemove="handleMouseMove"
          @mouseleave="drawBoard"
        ></canvas>
        <div class="grid-lines" :style="{ width: `${boardSize}px`, height: `${boardSize}px` }">
          <div v-for="i in 14" :key="i" class="line horizontal" :style="{ top: `${(i * gridSize)}px` }"></div>
          <div v-for="i in 14" :key="i" class="line vertical" :style="{ left: `${(i * gridSize)}px` }"></div>
        </div>
      </div>
    </div>

    <van-dialog
      v-model:show="showWinner"
      :title="`${store.winner === 1 ? '黑方' : '白方'}获胜！`"
      message="精彩的对决！"
      theme="round-button"
      confirmButtonText="再来一局"
      :showCancelButton="false"
      @confirm="store.resetGame"
    >
      <div class="result-info">
        <div class="result-icon">
          <div class="chess" :class="store.winner === 1 ? 'black' : 'white'"></div>
        </div>
        <div class="stats">
          <div class="winner">获胜方：{{ store.winner === 1 ? '黑方' : '白方' }}</div>
          <div class="time">用时：{{ formatTime(store.winner === 1 ? store.blackTime : store.whiteTime) }}</div>
          <div class="total-time">总用时：{{ formatTime(store.blackTime + store.whiteTime) }}</div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGobangStore, type ChessType } from '@/stores/gobang'
import { showDialog } from 'vant'

const router = useRouter()
const store = useGobangStore()
const boardRef = ref<HTMLCanvasElement | null>(null)
const boardSize = 360
const gridSize = boardSize / 15
const showWinner = ref(false)

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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

const startGame = () => {
  store.startGame()
  drawBoard()
}

const drawBoard = () => {
  const canvas = boardRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, boardSize, boardSize)
  store.board.forEach((row: ChessType[], y: number) => {
    row.forEach((cell: ChessType, x: number) => {
      if (cell !== 0) {
        ctx.beginPath()
        ctx.arc(
          x * gridSize + gridSize / 2,
          y * gridSize + gridSize / 2,
          gridSize * 0.4,
          0,
          Math.PI * 2
        )
        ctx.fillStyle = cell === 1 ? '#000' : '#fff'
        ctx.fill()
        if (cell === 2) {
          ctx.strokeStyle = '#000'
          ctx.stroke()
        }
      }
    })
  })
}

const handleClick = (e: MouseEvent) => {
  if (store.gameStatus !== 'playing') return
  
  const canvas = boardRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / gridSize)
  const y = Math.floor((e.clientY - rect.top) / gridSize)
  
  if (x >= 0 && x < 15 && y >= 0 && y < 15) {
    if (store.makeMove(x, y)) {
      drawBoard()
      if (store.winner !== 0) {
        showWinner.value = true
      }
    }
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (store.gameStatus !== 'playing') return
  const canvas = boardRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  drawBoard()
  const rect = canvas.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / gridSize)
  const y = Math.floor((e.clientY - rect.top) / gridSize)

  if (x >= 0 && x < 15 && y >= 0 && y < 15 && store.board[y][x] === 0) {
    ctx.beginPath()
    ctx.arc(
      x * gridSize + gridSize / 2,
      y * gridSize + gridSize / 2,
      gridSize * 0.4,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = store.currentPlayer === 1 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
    ctx.fill()
    if (store.currentPlayer === 2) {
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.stroke()
    }
  }
}

watch(() => store.board, drawBoard, { deep: true })

onMounted(() => {
  drawBoard()
})

onUnmounted(() => {
  store.resetGame()
})

// 路由守卫
watch(() => router.currentRoute.value.path, (newPath: string) => {
  if (newPath !== '/gobang') {
    store.resetGame()
  }
})
</script>

<style lang="scss" scoped>
.gobang {
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

    .player-panel {
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

      .players {
        display: flex;
        align-items: center;
        gap: 12px;

        .player-card {
          flex: 1;
          background: #f5f7fa;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          &.active {
            border-color: var(--primary-color);
            background: linear-gradient(145deg, var(--primary-color), #5c9ee5);
            color: white;
            transform: scale(1.05);

            .time {
              color: rgba(255, 255, 255, 0.8);
            }

            .status {
              background: rgba(255, 255, 255, 0.2);
              color: white;
            }
          }

          .player-info {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .chess {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              
              &.black {
                background: linear-gradient(145deg, #666, #000);
                box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
              }
              
              &.white {
                background: linear-gradient(145deg, #fff, #ddd);
                border: 1px solid #999;
                box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
              }
            }

            .details {
              .label {
                font-weight: bold;
                margin-bottom: 4px;
              }

              .time {
                font-size: 12px;
                color: #666;
              }
            }
          }

          .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            background: var(--primary-color);
            color: white;
          }
        }

        .vs {
          font-weight: bold;
          color: #666;
          font-size: 18px;
        }
      }
    }
  }

  .board-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-top: 20px;

    .board-container {
      position: relative;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      background: #f2b179;
      overflow: hidden;
      touch-action: none;
      user-select: none;
      width: fit-content;
      margin: 0 auto;
      
      &:hover {
        transform: none;
      }

      canvas {
        position: relative;
        z-index: 2;
        touch-action: none;
      }

      .grid-lines {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        pointer-events: none;

        .line {
          position: absolute;
          background: rgba(0, 0, 0, 0.2);

          &.horizontal {
            width: 100%;
            height: 1px;
          }

          &.vertical {
            width: 1px;
            height: 100%;
          }
        }
      }
    }
  }

  .result-info {
    padding: 24px;
    text-align: center;
    
    .result-icon {
      margin-bottom: 16px;
      
      .chess {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin: 0 auto;
        animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);

        &.black {
          background: linear-gradient(145deg, #666, #000);
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        &.white {
          background: linear-gradient(145deg, #fff, #ddd);
          border: 1px solid #999;
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
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