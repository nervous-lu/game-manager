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
                <span>每人有4秒时间查看身份</span>
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
            <div v-if="store.gameStatus === 'voting'" class="voting-section">
              <div class="voting-title">
                <span class="icon">🗳️</span>
                <span>第 {{ store.votingRound }} 轮投票</span>
              </div>

              <div class="voting-info">
                <div class="current-voter">
                  当前投票: 玩家{{ store.currentVotingPlayer + 1 }}
                </div>
                <div class="hint">
                  {{ store.votedPlayers.includes(store.currentVotingPlayer) 
                    ? '等待其他玩家投票' 
                    : '请选择你认为是卧底的玩家' }}
                </div>
              </div>

              <div class="player-grid">
                <div
                  v-for="player in store.players"
                  :key="player.id"
                  :class="[
                    'player-card',
                    { 
                      'eliminated': player.isEliminated,
                      'selected': selectedPlayer === player.id,
                      'has-votes': store.votes[player.id],
                      'current-voter': store.currentVotingPlayer === player.id,
                      'disabled': player.isEliminated
                    }
                  ]"
                  @click="handleVote(player)"
                >
                  <div class="player-icon">
                    {{ player.isEliminated ? '❌' : '👤' }}
                  </div>
                  <div class="player-name">玩家{{ player.id + 1 }}</div>
                  <div class="player-status">
                    <template v-if="player.isEliminated">
                      已出局
                    </template>
                    <template v-else-if="store.votes[player.id]">
                      {{ store.votes[player.id] }} 票
                    </template>
                    <template v-else>
                      等待投票
                    </template>
                  </div>
                  <div v-if="store.votes[player.id]" class="vote-count">
                    {{ store.votes[player.id] }}
                  </div>
                </div>
              </div>

              <div class="voting-controls">
                <van-button 
                  type="primary" 
                  block 
                  size="large"
                  :disabled="selectedPlayer === null || 
                            store.votedPlayers.includes(store.currentVotingPlayer) ||
                            selectedPlayer === store.currentVotingPlayer"
                  @click="confirmVote"
                >
                  {{ store.votedPlayers.includes(store.currentVotingPlayer) 
                    ? '已投票' 
                    : (selectedPlayer !== null ? '确认投票' : '请选择玩家') 
                  }}
                </van-button>
              </div>

              <van-dialog
                v-model:show="showVoteResult"
                :title="voteResultTitle"
                :message="voteResultMessage"
                theme="round-button"
                confirmButtonText="继续游戏"
                :showCancelButton="false"
                @confirm="store.handleVoteResult"
              >
                <div class="vote-result-info">
                  <div class="result-icon">{{ voteResultIcon }}</div>
                  <div class="eliminated-player">
                    {{ eliminatedPlayer ? `${eliminatedPlayer.id}号玩家出局` : '' }}
                  </div>
                  <div class="vote-stats">
                    <div v-for="(count, playerId) in voteStats" :key="playerId">
                      {{ playerId }}号: {{ count }}票
                    </div>
                  </div>
                </div>
              </van-dialog>
            </div>
          </template>
        </template>

        <template v-if="store.gameEnded">
          <div class="result-panel">
            <div class="result-icon">
              {{ store.winner.includes('平民') ? '👨‍👩👦‍' : '🕵️' }}
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
import { ref, onUnmounted, computed } from 'vue'
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

// 添加投票相关的状态
const selectedPlayer = ref<number | null>(null)
const showVoteResult = ref(false)
const voteStats = ref<Record<number, number>>({})
const eliminatedPlayer = ref<{ id: number } | null>(null)

// 投票结果相关的计算属性
const voteResultTitle = computed(() => {
  return eliminatedPlayer.value ? '投票结果' : '平局'
})

const voteResultMessage = computed(() => {
  return eliminatedPlayer.value 
    ? `${eliminatedPlayer.value.id}号玩家被投票出局` 
    : '票数相同，请重新投票'
})

const voteResultIcon = computed(() => {
  return eliminatedPlayer.value ? '🗳️' : '🤝'
})

// 投票相关的方法
const handleVote = (player: any) => {
  console.log('=== handleVote ===')
  console.log('当前投票玩家:', store.currentVotingPlayer + 1)
  console.log('被选中玩家:', player.id + 1)
  console.log('已投票玩家:', store.votedPlayers)
  console.log('游戏状态:', store.gameStatus)
  
  // 如果当前不是投票阶段，直接返回
  if (store.gameStatus !== 'voting') return
  
  // 如果已经投过票，直接返回
  if (store.votedPlayers.includes(store.currentVotingPlayer)) {
    console.log('该玩家已经投过票')
    return
  }
  
  // 如果是已淘汰的玩家，直接返回
  if (player.isEliminated) {
    console.log('目标玩家已淘汰')
    return
  }
  
  // 如果是当前投票玩家自己，直接返回
  if (player.id === store.currentVotingPlayer) {
    console.log('不能投票给自己')
    return
  }
  
  // 设置选中的玩家
  selectedPlayer.value = player.id
  console.log('选中玩家:', selectedPlayer.value + 1)
}

const confirmVote = () => {
  console.log('=== confirmVote ===')
  console.log('当前投票玩家:', store.currentVotingPlayer + 1)
  console.log('选中的目标:', selectedPlayer.value ? selectedPlayer.value + 1 : null)
  console.log('已投票玩家:', store.votedPlayers.map(id => id + 1))
  
  if (!selectedPlayer.value || 
      store.votedPlayers.includes(store.currentVotingPlayer) ||
      selectedPlayer.value === store.currentVotingPlayer) {
    console.log('投票无效:', {
      noSelection: !selectedPlayer.value,
      alreadyVoted: store.votedPlayers.includes(store.currentVotingPlayer),
      voteSelf: selectedPlayer.value === store.currentVotingPlayer
    })
    return
  }
  
  const targetId = selectedPlayer.value
  store.vote(store.currentVotingPlayer, targetId)
  console.log('投票完成')
  // 只有在投票成功后才清空选择
  if (!store.votedPlayers.includes(store.currentVotingPlayer)) {
    selectedPlayer.value = null
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
  store.startVoting()
}

// 组件卸载时清理
onUnmounted(() => {
  store.resetGame()
})

const getPlayerDesc = (count: number): string => {
  return `${count - 1}平民 1底`
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
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      &.selected {
        border: 2px solid var(--primary-color);
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

.voting-section {
  .voting-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: bold;
    
    .icon {
      font-size: 24px;
    }
  }

  .voting-info {
    text-align: center;
    margin-bottom: 24px;
    
    .current-voter {
      font-size: 18px;
      font-weight: bold;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .hint {
      font-size: 14px;
      color: #666;
    }
  }

  .player-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
    margin-bottom: 24px;

    .player-card {
      position: relative;
      padding: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: var(--card-shadow);
      cursor: pointer;
      transition: all 0.3s ease;

      &:not(.eliminated):hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      &.selected {
        border: 2px solid var(--primary-color);
        transform: scale(1.05);
      }

      &.eliminated {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .player-info {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .player-number {
          font-size: 18px;
          font-weight: bold;
        }

        .player-status {
          .eliminated-tag {
            font-size: 12px;
            color: #ff4d4f;
          }

          .voted-count {
            font-size: 14px;
            color: var(--primary-color);
            font-weight: bold;
          }
        }
      }

      .vote-animation {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        animation: voteUp 1s ease-out;

        .vote-icon {
          font-size: 24px;
        }
      }
    }
  }
}

@keyframes voteUp {
  0% {
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(-20px);
    opacity: 0;
  }
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  .player-card {
    position: relative;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: var(--card-shadow);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;

    &:not(.eliminated):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    &.selected {
      border: 2px solid var(--primary-color);
      transform: scale(1.05);
      background: linear-gradient(145deg, #e8f4ff, #f5f9ff);
    }

    &.eliminated {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f5f5f5;
      
      .player-icon {
        color: #ff4d4f;
      }
    }

    &.current-voter {
      border: 2px dashed var(--primary-color);
      animation: pulse 2s infinite;
    }

    &.has-votes {
      .vote-count {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 24px;
        height: 24px;
        background: var(--primary-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
    }

    .player-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .player-name {
      font-weight: bold;
      margin-bottom: 8px;
    }

    .player-status {
      font-size: 14px;
      color: #666;
    }
  }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(var(--primary-color-rgb), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0); }
}

@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style> 