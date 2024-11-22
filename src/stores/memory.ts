import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Card {
  id: number
  value: string
  isFlipped: boolean
  isMatched: boolean
}

interface MemoryState {
  cards: Card[]
  moves: number
  gameStatus: 'waiting' | 'preview' | 'playing' | 'won'
  difficulty: 'easy' | 'medium' | 'hard'
  flippedCards: number[]
}

export const useMemoryStore = defineStore('memory', () => {
  const state = ref<MemoryState>({
    cards: [],
    moves: 0,
    gameStatus: 'waiting',
    difficulty: 'easy',
    flippedCards: []
  })

  function initGame() {
    // 根据难度生成不同数量的卡片
    const cardCount = {
      easy: 12,
      medium: 20,
      hard: 30
    }[state.value.difficulty]

    // 生成卡片，使用更容易区分的表情符号组合
    const values = [
      '🐼', '🦊', '🦁', '🐯', '🐨', '🐮',  // 动物系列
      '🍎', '🍌', '🍇', '🍉', '🍓', '🍑',  // 水果系列
      '⚽', '🏀', '🎾', '⚾', '🎱', '🏓',   // 运动系列
      '🌞', '🌙', '⭐', '☁️', '🌈', '❄️',   // 天气系列
      '🎸', '🎹', '🎺', '🎻', '🥁', '🎷'    // 乐器系列
    ]

    const selectedValues = values.slice(0, cardCount / 2)
    const cards = [...selectedValues, ...selectedValues]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: true,  // 初始时全部翻开
        isMatched: false
      }))

    state.value.cards = cards
    state.value.moves = 0
    state.value.gameStatus = 'preview'
    state.value.flippedCards = []

    // 根据难度设置不同的预览时间
    const previewTime = {
      easy: 3000,    // 3秒
      medium: 5000,  // 5秒
      hard: 7000     // 7秒
    }[state.value.difficulty]

    // 预览时间结束后翻回所有卡片
    setTimeout(() => {
      state.value.cards.forEach(card => {
        card.isFlipped = false
      })
      state.value.gameStatus = 'playing'
    }, previewTime)
  }

  function flipCard(cardId: number) {
    if (state.value.gameStatus !== 'playing') return
    if (state.value.flippedCards.length >= 2) return
    
    const card = state.value.cards.find(c => c.id === cardId)
    if (!card || card.isMatched || card.isFlipped) return

    // 翻转卡片
    card.isFlipped = true
    state.value.flippedCards.push(cardId)

    // 如果已经翻开两张卡片
    if (state.value.flippedCards.length === 2) {
      state.value.moves++
      const [firstId, secondId] = state.value.flippedCards
      const firstCard = state.value.cards.find(c => c.id === firstId)!
      const secondCard = state.value.cards.find(c => c.id === secondId)!

      // 检查是否匹配
      if (firstCard.value === secondCard.value) {
        firstCard.isMatched = true
        secondCard.isMatched = true
        firstCard.isFlipped = true  // 确保匹配的卡片保持翻转状态
        secondCard.isFlipped = true
        state.value.flippedCards = []
        
        // 检查是否获胜
        if (state.value.cards.every(card => card.isMatched)) {
          state.value.gameStatus = 'won'
        }
      } else {
        // 不匹配，延迟翻回
        setTimeout(() => {
          firstCard.isFlipped = false
          secondCard.isFlipped = false
          state.value.flippedCards = []
        }, 1000)
      }
    }
  }

  function resetGame() {
    state.value.gameStatus = 'waiting'
    state.value.cards = []
    state.value.moves = 0
    state.value.flippedCards = []
  }

  return {
    cards: computed(() => state.value.cards),
    moves: computed(() => state.value.moves),
    gameStatus: computed(() => state.value.gameStatus),
    difficulty: computed({
      get: () => state.value.difficulty,
      set: (value: 'easy' | 'medium' | 'hard') => {
        state.value.difficulty = value
      }
    }),
    initGame,
    flipCard,
    resetGame
  }
}) 