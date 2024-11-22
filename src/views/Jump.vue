<template>
  <div class="page-container jump">
    <div class="header">
      <van-icon name="arrow-left" @click="handleBack" />
      <h1>跳一跳</h1>
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
        @click="store.initGame"
        size="large"
      >
        {{ store.gameStatus === 'playing' ? '重新开始' : '开始游戏' }}
        <template #icon>
          <van-icon :name="store.gameStatus === 'playing' ? 'replay' : 'play-circle-o'" />
        </template>
      </van-button>
    </div>

    <div class="game-container">
      <div class="game-area" 
        @touchstart="startJump"
        @touchend="endJump"
        @mousedown="startJump"
        @mouseup="endJump"
      >
        <!-- 背景元素 -->
        <div class="background">
          <div class="clouds">
            <div class="cloud" v-for="i in 3" :key="i"></div>
          </div>
          <div class="mountains"></div>
        </div>

        <!-- 力度指示器 -->
        <div class="power-meter" v-if="isCharging">
          <div class="power-bar" :style="{ width: `${jumpPower}%` }"></div>
        </div>

        <!-- 角色 -->
        <div class="character" :style="characterStyle" :class="{ jumping: store.character.jumping }">
          <div class="character-body">🏃</div>
          <div class="shadow"></div>
        </div>

        <!-- 平台 -->
        <div class="platform current" :style="currentPlatformStyle">
          <div class="platform-top"></div>
          <div class="platform-side"></div>
        </div>
        <div class="platform next" :style="nextPlatformStyle">
          <div class="platform-top"></div>
          <div class="platform-side"></div>
        </div>
      </div>
    </div>

    <van-dialog
      v-model:show="showResult"
      title="游戏结束"
      message="很遗憾，没有跳到平台上！"
      theme="round-button"
      confirmButtonText="再来一局"
      :showCancelButton="false"
      @confirm="store.initGame"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJumpStore } from '@/stores/jump'
import { showDialog } from 'vant'

const router = useRouter()
const store = useJumpStore()
const showResult = ref(false)
let jumpStartTime = 0
const isCharging = ref(false)
const jumpPower = ref(0)

const characterStyle = computed(() => ({
  left: `${store.character.x}px`,
  bottom: `${store.character.y + 50}px`  // 50px 是基础高度
}))

const currentPlatformStyle = computed(() => ({
  left: `${store.currentPlatform.x}px`,
  width: `${store.currentPlatform.width}px`
}))

const nextPlatformStyle = computed(() => ({
  left: `${store.nextPlatform.x}px`,
  width: `${store.nextPlatform.width}px`
}))

const startJump = () => {
  if (store.gameStatus !== 'playing') return
  isCharging.value = true
  jumpPower.value = 0
  jumpStartTime = Date.now()

  // 动画力度条
  const animatePower = () => {
    if (!isCharging.value) return
    jumpPower.value = Math.min(((Date.now() - jumpStartTime) / 20), 100)
    requestAnimationFrame(animatePower)
  }
  requestAnimationFrame(animatePower)
}

const endJump = () => {
  if (store.gameStatus !== 'playing') return
  isCharging.value = false
  const power = jumpPower.value
  jumpPower.value = 0
  store.jump(power)
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
      router.push('/')
    } catch {
      // 用户取消，继续游戏
    }
  } else {
    router.push('/')
  }
}

onMounted(() => {
  store.initGame()
})

onUnmounted(() => {
  store.resetGame()
})
</script>

<style lang="scss" scoped>
.jump {
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

  .game-container {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
    background: linear-gradient(180deg, #87CEEB, #E0F6FF);
    border-radius: 16px;
    box-shadow: var(--card-shadow);

    .game-area {
      position: relative;
      width: 100%;
      height: 100%;
      touch-action: none;

      .background {
        position: absolute;
        width: 100%;
        height: 100%;
        
        .clouds {
          position: absolute;
          width: 100%;
          height: 40%;
          top: 0;

          .cloud {
            position: absolute;
            width: 60px;
            height: 30px;
            background: white;
            border-radius: 15px;
            opacity: 0.8;
            animation: floatCloud 20s linear infinite;

            &:nth-child(1) { top: 20%; left: -60px; animation-delay: 0s; }
            &:nth-child(2) { top: 40%; left: -60px; animation-delay: -7s; }
            &:nth-child(3) { top: 60%; left: -60px; animation-delay: -14s; }

            &::before,
            &::after {
              content: '';
              position: absolute;
              background: white;
              border-radius: 50%;
            }

            &::before {
              width: 25px;
              height: 25px;
              top: -10px;
              left: 15px;
            }

            &::after {
              width: 20px;
              height: 20px;
              top: -5px;
              left: 35px;
            }
          }
        }

        .mountains {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 30%;
          background: linear-gradient(45deg, #4a6741 25%, transparent 25%) -50px 0,
                      linear-gradient(-45deg, #4a6741 25%, transparent 25%) -50px 0,
                      linear-gradient(45deg, transparent 75%, #4a6741 75%),
                      linear-gradient(-45deg, transparent 75%, #4a6741 75%);
          background-size: 100px 100px;
          opacity: 0.3;
        }
      }

      .power-meter {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 10px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 5px;
        overflow: hidden;

        .power-bar {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #FFC107);
          transition: width 0.1s linear;
        }
      }

      .character {
        position: absolute;
        transition: all 0.3s ease;

        .character-body {
          font-size: 32px;
          transform-origin: bottom center;
          transition: transform 0.3s ease;
        }

        .shadow {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 6px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        &.jumping {
          .character-body {
            animation: jump 0.6s ease-out;
          }
          .shadow {
            animation: shadowScale 0.6s ease-out;
          }
        }
      }

      .platform {
        position: absolute;
        height: 20px;

        .platform-top {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #81C784);
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .platform-side {
          position: absolute;
          top: 100%;
          width: 100%;
          height: 10px;
          background: #388E3C;
          border-radius: 0 0 8px 8px;
          transform: skewX(-45deg);
          transform-origin: left top;
        }

        &.current .platform-top {
          background: linear-gradient(90deg, #2196F3, #64B5F6);
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
}

@keyframes floatCloud {
  from { transform: translateX(-60px); }
  to { transform: translateX(calc(100vw + 60px)); }
}

@keyframes jump {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(15deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes shadowScale {
  0% { transform: translateX(-50%) scale(1); opacity: 0.2; }
  50% { transform: translateX(-50%) scale(0.5); opacity: 0.1; }
  100% { transform: translateX(-50%) scale(1); opacity: 0.2; }
}
</style> 