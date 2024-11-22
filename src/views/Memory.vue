<template>
  <div class="page-container memory">
    <div class="header">
      <van-icon name="arrow-left" @click="handleBack" />
      <h1>记忆翻牌</h1>
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
          <van-icon name="replay" />
          <span>{{ store.moves }} 步</span>
        </div>
        <div v-if="store.gameStatus === 'preview'" class="info-item preview-countdown">
          <van-icon name="clock-o" />
          <span class="countdown">{{ previewTimer }}s</span>
          <span class="hint">记忆时间</span>
        </div>
      </div>

      <van-button 
        type="primary" 
        block 
        @click="store.initGame"
        size="large"
      >
        {{ store.gameStatus === 'playing' ? '重新开始' : '开始游戏' }}
        <template #icon>
          <van-icon :name="store.gameStatus === 'playing' ? 'replay' : 'play-circle-o'" />
        </template>
      </van-button>
    </div>

    <div class="cards-container">
      <div class="cards-grid" :class="store.difficulty">
        <div
          v-for="card in store.cards"
          :key="card.id"
          class="card"
          :class="{
            'flipped': card.isFlipped || card.isMatched,
            'matched': card.isMatched
          }"
          @click="flipCard(card)"
        >
          <div class="card-inner">
            <div class="card-front">❓</div>
            <div class="card-back">{{ card.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <van-dialog
      v-model:show="showSuccess"
      title="恭喜完成！"
      message="你已成功匹配所有卡片！"
      theme="round-button"
      confirmButtonText="再来一局"
      :showCancelButton="false"
      @confirm="store.initGame"
    >
      <div class="result-info">
        <div class="result-icon">🎮</div>
        <div class="stats">
          <div class="moves">总步数：{{ store.moves }} 步</div>
          <div class="difficulty">难度：{{ getDifficultyLabel(store.difficulty) }}</div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMemoryStore } from '@/stores/memory'
import { showDialog } from 'vant'

const router = useRouter()
const store = useMemoryStore()
const showSuccess = ref(false)
const previewTimer = ref(0)
let previewInterval: ReturnType<typeof setInterval> | null = null

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

const setDifficulty = (difficulty: string) => {
  store.difficulty = difficulty as 'easy' | 'medium' | 'hard'
  store.initGame()
  startPreviewTimer()
}

const startPreviewTimer = () => {
  const previewTimes: Record<string, number> = {
    easy: 3,
    medium: 5,
    hard: 7
  }
  
  previewTimer.value = previewTimes[store.difficulty as keyof typeof previewTimes]
  
  if (previewInterval) {
    clearInterval(previewInterval)
  }
  
  previewInterval = setInterval(() => {
    if (previewTimer.value > 0) {
      previewTimer.value--
    } else {
      clearInterval(previewInterval!)
      previewInterval = null
    }
  }, 1000)
}

const flipCard = (card: any) => {
  if (store.gameStatus === 'playing' && !card.isFlipped && !card.isMatched) {
    store.flipCard(card.id)
    if (store.gameStatus === 'won') {
      showSuccess.value = true
    }
  }
}

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
    easy: '12 张卡片',
    medium: '20 张卡片',
    hard: '30 张卡片'
  }
  return descs[level as keyof typeof descs]
}

onMounted(() => {
  store.resetGame()
})

onUnmounted(() => {
  store.resetGame()
  if (previewInterval) {
    clearInterval(previewInterval)
    previewInterval = null
  }
})

watch(() => router.currentRoute.value.path, (newPath: string) => {
  if (newPath !== '/memory') {
    store.resetGame()
  }
})

watch(() => store.gameStatus, (newStatus) => {
  if (newStatus === 'preview') {
    startPreviewTimer()
  }
})
</script>

<style lang="scss" scoped>
.memory {
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

      .preview-countdown {
        background: var(--primary-color);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        animation: pulse 1s infinite;

        .countdown {
          font-size: 24px;
          font-weight: bold;
          margin: 0 8px;
        }

        .hint {
          font-size: 14px;
          opacity: 0.8;
        }

        .van-icon {
          font-size: 20px;
        }
      }
    }
  }

  .cards-container {
    position: relative;
    display: flex;
    justify-content: center;
    margin-top: 24px;
    padding-bottom: 40px;

    .cards-grid {
      display: grid;
      gap: 16px;
      padding: 24px;
      background: linear-gradient(145deg, #f0f4f8, #e6eef8);
      border-radius: 16px;
      box-shadow: var(--card-shadow);
      width: 100%;
      max-width: 900px;

      &.easy {
        grid-template-columns: repeat(4, 1fr);
      }

      &.medium {
        grid-template-columns: repeat(5, 1fr);
      }

      &.hard {
        grid-template-columns: repeat(6, 1fr);
      }

      .card {
        aspect-ratio: 1;
        perspective: 1000px;
        cursor: pointer;

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;

          .card-front,
          .card-back {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .card-front {
            background: linear-gradient(145deg, #ffffff, #f0f4f8);
            border: 2px solid #e0e6f0;
            color: #666;
            font-size: 36px;
            transform: rotateY(0deg);
          }

          .card-back {
            background: linear-gradient(145deg, var(--primary-color), #5c9ee5);
            color: white;
            font-size: 56px;
            transform: rotateY(180deg);
          }
        }

        &.flipped .card-inner {
          transform: rotateY(180deg);
        }

        &.matched {
          pointer-events: none;
          
          .card-inner {
            transform: rotateY(180deg);
            
            .card-back {
              background: linear-gradient(145deg, #4CAF50, #81C784);
              animation: pulse 2s infinite;
              box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
              transform: rotateY(180deg);
              backface-visibility: visible;
            }
          }
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

  @keyframes pulse {
    from {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.4);
    }
    70% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(var(--primary-color-rgb), 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes pulse {
    0% { transform: rotateY(0deg) scale(1); }
    50% { transform: rotateY(0deg) scale(1.05); }
    100% { transform: rotateY(0deg) scale(1); }
  }
}

@media (max-width: 768px) {
  .memory {
    .cards-container {
      .cards-grid {
        gap: 12px;
        padding: 16px;

        .card {
          .card-front { font-size: 28px; }
          .card-back { font-size: 42px; }
        }
      }
    }
  }
}
</style>