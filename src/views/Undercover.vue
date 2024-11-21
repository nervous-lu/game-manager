<template>
  <div class="page-container undercover">
    <div class="header">
      <van-icon name="arrow-left" @click="handleBack" />
      <h1>谁是卧底</h1>
    </div>

    <template v-if="!store.gameStarted">
      <div class="setup-panel">
        <h2>游戏设置</h2>
        <div class="setup-content">
          <div class="player-count-selector">
            <div class="section-title">
              <span class="icon">👥</span>
              <span>选择玩家人数</span>
            </div>
            <div class="options-grid">
              <div
                v-for="count in store.playerOptions"
                :key="count"
                class="option-item"
                :class="{ active: store.playerCount === count }"
                @click="store.playerCount = count"
              >
                <div class="count">{{ count }}人</div>
                <div class="desc">{{ getPlayerDesc(count) }}</div>
                <div class="check-icon" v-if="store.playerCount === count">
                  <van-icon name="success" />
                </div>
              </div>
            </div>
          </div>

          <div class="game-rules">
            <div class="section-title">
              <span class="icon">📜</span>
              <span>游戏规则</span>
            </div>
            <div class="rules-content">
              <div class="rule-item">
                <van-icon name="circle" />
                <span>每局游戏只有1名卧底</span>
              </div>
              <div class="rule-item">
                <van-icon name="circle" />
                <span>每人有5秒时间查看身份</span>
              </div>
              <div class="rule-item">
                <van-icon name="circle" />
                <span>共有3轮投票机会</span>
              </div>
              <div class="rule-item">
                <van-icon name="circle" />
                <span>超过半数投票才能淘汰玩家</span>
              </div>
            </div>
          </div>
        </div>

        <van-button type="primary" block @click="startGame" size="large">
          开始游戏
          <template #icon>
            <van-icon name="play-circle-o" />
          </template>
        </van-button>
      </div>
    </template>

    <template v-else>
      <div class="game-panel">
        <template v-if="!store.gameEnded">
          <div class="phase-indicator">
            <div class="phase" :class="{ active: gamePhase === 'view' }">
              <span class="icon">👀</span>
              <span class="text">查看身份</span>
            </div>
            <div class="divider">→</div>
            <div class="phase" :class="{ active: gamePhase === 'vote' }">
              <span class="icon">🗳️</span>
              <span class="text">投票环节</span>
            </div>
          </div>

          <template v-if="gamePhase === 'view'">
            <div v-if="store.currentViewingPlayer === -1" class="player-grid">
              <div
                v-for="player in store.players"
                :key="player.id"
                :class="[
                  'player-card',
                  player.viewed ? 'viewed' : 'unviewed',
                  { 'disabled': player.viewed }
                ]"
                @click="!player.viewed && viewCard(player.id)"
              >
                <div class="player-icon">
                  {{ player.viewed ? '✅' : '🔒' }}
                </div>
                <div class="player-name">玩家{{ player.id + 1 }}</div>
                <div class="player-status">
                  {{ player.viewed ? '已查看身份' : '点击查看身份' }}
                </div>
              </div>
            </div>
            <div v-else class="word-card">
              <div class="card-inner" :class="{ flipped: showWord }">
                <div class="card-front">
                  <van-icon name="question-o" />
                  <div class="hint">点击查看词语</div>
                </div>
                <div class="card-back">
                  <div class="word">{{ store.players[store.currentViewingPlayer].word }}</div>
                  <div class="timer">{{ timer }}s</div>
                </div>
              </div>
            </div>
            
            <van-button 
              v-if="allPlayersViewed"
              type="primary" 
              block 
              @click="startVoting"
              size="large"
            >
              开始投票
              <template #icon>
                <van-icon name="play-circle-o" />
              </template>
            </van-button>
          </template>

          <template v-else>
            <div class="vote-panel">
              <div class="vote-header">
                <h3>投票环节</h3>
                <div class="vote-progress">
                  <span class="round">第 {{ store.votingRound + 1 }} 轮</span>
                  <div class="progress-bar">
                    <div 
                      class="progress" 
                      :style="{ width: `${(store.votingRound / store.maxVotingRounds) * 100}%` }"
                    ></div>
                  </div>
                  <span class="total">共 {{ store.maxVotingRounds }} 轮</span>
                </div>
              </div>
              
              <div class="vote-grid">
                <div
                  v-for="player in store.players"
                  :key="player.id"
                  :class="[
                    'vote-card',
                    player.isEliminated ? 'eliminated' : '',
                    player.votes > 0 ? 'has-votes' : ''
                  ]"
                  @click="!player.isEliminated && store.eliminatePlayer(player.id)"
                >
                  <div class="player-icon">
                    {{ player.isEliminated ? '❌' : '👤' }}
                  </div>
                  <div class="player-name">玩家{{ player.id + 1 }}</div>
                  <div class="vote-count" v-if="player.votes > 0">
                    {{ player.votes }} 票
                  </div>
                  <div class="vote-button" v-if="!player.isEliminated">
                    投票淘汰
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>

        <template v-if="store.gameEnded">
          <div class="result-panel">
            <div class="result-icon">
              {{ store.winner.includes('平民') ? '👨‍👩‍👦‍👦' : '🕵️' }}
            </div>
            <h2>游戏结束</h2>
            <p>{{ store.winner }}</p>
            <div class="word-reveal">
              <div class="word-item">
                <span class="label">平民词:</span>
                <span class="value">{{ store.currentWordPair?.common }}</span>
              </div>
              <div class="word-item">
                <span class="label">卧底词:</span>
                <span class="value">{{ store.currentWordPair?.undercover }}</span>
              </div>
            </div>
            <van-button type="primary" block @click="store.resetGame" size="large">
              再来一局
              <template #icon>
                <van-icon name="replay" />
              </template>
            </van-button>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUndercoverStore } from '@/stores/undercover'
import { showDialog } from 'vant'  // 修改导入

const router = useRouter()
const store = useUndercoverStore()
const timer = ref<number>(5)
const showWord = ref<boolean>(false)
let timerInterval: number | null = null
const gamePhase = ref<'view' | 'vote'>('view')
const allPlayersViewed = ref<boolean>(false)

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
  gamePhase.value = 'view'
  allPlayersViewed.value = false
}

const viewCard = (playerId: number) => {
  store.viewCard(playerId)
  timer.value = 4
  showWord.value = false
  
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  
  setTimeout(() => {
    showWord.value = true
  }, 100)
  
  timerInterval = window.setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
      showWord.value = false
      setTimeout(() => {
        store.hideCard()
        store.markPlayerViewed(playerId)
        // 检查是否所有玩家都已查看
        if (store.allPlayersViewed) {
          allPlayersViewed.value = true
        }
      }, 300)
    }
  }, 1000)
}

const startVoting = () => {
  gamePhase.value = 'vote'
}

// 组件卸载时清理
onUnmounted(() => {
  store.resetGame()
})

const getPlayerDesc = (count: number): string => {
  return `${count - 1}平民 1卧底`
}
</script>

<style lang="scss" scoped>
.undercover {
  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;

    .van-icon {
      font-size: 24px;
    }
  }

  .setup-panel {
    padding: 20px;
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--card-shadow);

    h2 {
      text-align: center;
      margin-bottom: 32px;
      color: var(--primary-color);
      font-size: 24px;
    }

    .setup-content {
      margin-bottom: 32px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: bold;
      color: var(--text-color);

      .icon {
        font-size: 24px;
      }
    }

    .player-count-selector {
      margin-bottom: 32px;

      .options-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

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

            .desc {
              color: rgba(255, 255, 255, 0.8);
            }

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

          .desc {
            font-size: 14px;
            color: #666;
            transition: color 0.3s ease;
          }
        }
      }
    }

    .game-rules {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;

      .rules-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .rule-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        font-size: 14px;

        .van-icon {
          color: var(--primary-color);
          font-size: 12px;
        }
      }
    }

    .van-button {
      margin-top: 16px;
      height: 48px;
      font-size: 18px;

      .van-icon {
        font-size: 20px;
      }
    }
  }

  .game-panel {
    padding-bottom: 40px;

    .player-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .player-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 2px solid transparent;

      &.unviewed {
        cursor: pointer;
        background: linear-gradient(145deg, #ffffff, #f0f0f0);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        &:active {
          transform: scale(0.98);
        }

        .player-icon {
          color: var(--warning-color);
        }

        .player-status {
          color: var(--primary-color);
        }
      }

      &.viewed {
        background: linear-gradient(145deg, #f5f5f5, #e0e0e0);
        border-color: var(--success-color);
        cursor: not-allowed;
        opacity: 0.8;

        .player-icon {
          color: var(--success-color);
        }

        .player-status {
          color: #999;
        }
      }

      &.disabled {
        pointer-events: none;
      }

      .player-icon {
        font-size: 32px;
        margin-bottom: 8px;
        transition: transform 0.3s ease;
      }

      .player-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 4px;
        color: var(--text-color);
      }

      .player-status {
        font-size: 12px;
        transition: color 0.3s ease;
      }
    }

    .word-card {
      height: 200px;
      perspective: 1000px;

      .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.6s;
        transform-style: preserve-3d;
        cursor: pointer;

        &.flipped {
          transform: rotateY(180deg);
        }

        .card-front,
        .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .card-front {
          .van-icon {
            font-size: 48px;
            color: var(--primary-color);
            margin-bottom: 16px;
          }

          .hint {
            color: #666;
          }
        }

        .card-back {
          transform: rotateY(180deg);
          background: var(--primary-color);
          color: white;

          .word {
            font-size: 32px;
            margin-bottom: 16px;
          }

          .timer {
            font-size: 24px;
          }
        }
      }
    }

    .vote-panel {
      margin-top: 32px;
      padding-bottom: 40px;

      .vote-header {
        text-align: center;
        margin-bottom: 24px;

        .vote-progress {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;

          .round, .total {
            font-size: 14px;
            color: #666;
          }

          .progress-bar {
            flex: 1;
            height: 4px;
            background: #eee;
            border-radius: 2px;
            overflow: hidden;

            .progress {
              height: 100%;
              background: var(--primary-color);
              transition: width 0.3s ease;
            }
          }
        }
      }

      .vote-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .vote-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        &.eliminated {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &.has-votes {
          border: 2px solid var(--primary-color);
        }

        .player-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .player-name {
          margin-bottom: 12px;
        }

        .vote-button {
          background: var(--danger-color);
          color: white;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;

          &:active {
            transform: scale(0.95);
          }
        }

        .vote-count {
          position: absolute;
          top: 8px;
          right: 8px;
          background: var(--primary-color);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
      }
    }

    .result-panel {
      text-align: center;
      padding: 32px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

      .result-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      h2 {
        margin-bottom: 8px;
      }

      p {
        font-size: 24px;
        color: var(--primary-color);
        margin-bottom: 24px;
      }

      .word-reveal {
        margin-bottom: 32px;
        
        .word-item {
          margin-bottom: 12px;
          
          .label {
            color: #666;
            margin-right: 8px;
          }
          
          .value {
            font-weight: bold;
          }
        }
      }
    }

    .phase-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .phase {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        opacity: 0.5;
        transition: all 0.3s ease;

        &.active {
          opacity: 1;
          transform: scale(1.1);
        }

        .icon {
          font-size: 24px;
        }

        .text {
          font-size: 14px;
          color: var(--text-color);
        }
      }

      .divider {
        color: #999;
        font-size: 20px;
      }
    }

    .player-card {
      &.viewed {
        background: #f5f5f5;
        cursor: not-allowed;

        .player-icon {
          color: var(--success-color);
        }

        .player-status {
          color: #999;
        }
      }
    }
  }
}
</style> 