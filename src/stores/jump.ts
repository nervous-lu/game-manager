import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface JumpState {
  score: number
  bestScore: number
  gameStatus: 'waiting' | 'playing' | 'ended'
  currentPlatform: {
    x: number
    width: number
    distance: number
  }
  nextPlatform: {
    x: number
    width: number
    distance: number
  }
  character: {
    x: number
    y: number
    jumping: boolean
  }
}

export const useJumpStore = defineStore('jump', () => {
  const state = ref<JumpState>({
    score: 0,
    bestScore: 0,
    gameStatus: 'waiting',
    currentPlatform: {
      x: 50,
      width: 80,
      distance: 150
    },
    nextPlatform: {
      x: 200,
      width: 80,
      distance: 150
    },
    character: {
      x: 90,
      y: 0,
      jumping: false
    }
  })

  function initGame() {
    state.value.score = 0
    state.value.gameStatus = 'playing'
    resetPlatforms()
  }

  function resetPlatforms() {
    state.value.currentPlatform = {
      x: 50,
      width: 80,
      distance: 150
    }
    state.value.nextPlatform = {
      x: 200,
      width: getRandomWidth(),
      distance: getRandomDistance()
    }
    state.value.character = {
      x: state.value.currentPlatform.x + 40,
      y: 0,
      jumping: false
    }
  }

  function getRandomWidth() {
    return Math.floor(Math.random() * 40) + 60 // 60-100之间的随机宽度
  }

  function getRandomDistance() {
    return Math.floor(Math.random() * 100) + 100 // 100-200之间的随机距离
  }

  function jump(power: number) {
    if (state.value.gameStatus !== 'playing' || state.value.character.jumping) return

    state.value.character.jumping = true
    const jumpDistance = power * 2

    // 模拟跳跃动画
    const jumpAnimation = () => {
      state.value.character.x += jumpDistance / 30
      state.value.character.y = Math.sin((state.value.character.x - state.value.currentPlatform.x) / 50) * 100

      if (state.value.character.x >= state.value.nextPlatform.x) {
        // 检查是否成功落在平台上
        if (
          state.value.character.x <= state.value.nextPlatform.x + state.value.nextPlatform.width &&
          state.value.character.y <= 10
        ) {
          // 成功跳跃
          state.value.score++
          if (state.value.score > state.value.bestScore) {
            state.value.bestScore = state.value.score
          }
          // 生成新的平台
          state.value.currentPlatform = state.value.nextPlatform
          state.value.nextPlatform = {
            x: state.value.currentPlatform.x + state.value.currentPlatform.distance,
            width: getRandomWidth(),
            distance: getRandomDistance()
          }
          state.value.character = {
            x: state.value.currentPlatform.x + 40,
            y: 0,
            jumping: false
          }
        } else {
          // 跳跃失败
          state.value.gameStatus = 'ended'
        }
        return
      }

      requestAnimationFrame(jumpAnimation)
    }

    requestAnimationFrame(jumpAnimation)
  }

  return {
    score: computed(() => state.value.score),
    bestScore: computed(() => state.value.bestScore),
    gameStatus: computed(() => state.value.gameStatus),
    currentPlatform: computed(() => state.value.currentPlatform),
    nextPlatform: computed(() => state.value.nextPlatform),
    character: computed(() => state.value.character),
    initGame,
    jump
  }
}) 