import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface PuzzleState {
  board: number[][]
  size: number
  moves: number
  gameStatus: 'waiting' | 'playing' | 'won'
}

export const usePuzzleStore = defineStore('puzzle', () => {
  // 状态定义
  const state = ref<PuzzleState>({
    board: [],
    size: 3,
    moves: 0,
    gameStatus: 'waiting'
  })

  // 计算属性
  const size = computed(() => state.value.size)
  const board = computed(() => state.value.board)
  const moves = computed(() => state.value.moves)
  const gameStatus = computed(() => state.value.gameStatus)

  // 初始化棋盘
  function initBoard() {
    const numbers = Array.from({ length: state.value.size * state.value.size - 1 }, (_, i) => i + 1)
    numbers.push(0) // 添加空格
    
    // 随机打乱数组
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
    }
    
    // 转换为二维数组
    state.value.board = []
    for (let i = 0; i < state.value.size; i++) {
      state.value.board.push(numbers.slice(i * state.value.size, (i + 1) * state.value.size))
    }
    
    state.value.moves = 0
    state.value.gameStatus = 'playing'
  }

  // 移动方块
  function move(row: number, col: number): boolean {
    if (state.value.gameStatus !== 'playing') return false

    const directions = [
      [-1, 0], // 上
      [1, 0],  // 下
      [0, -1], // 左
      [0, 1]   // 右
    ]

    for (const [dx, dy] of directions) {
      const newRow = row + dx
      const newCol = col + dy

      if (
        newRow >= 0 && 
        newRow < state.value.size && 
        newCol >= 0 && 
        newCol < state.value.size && 
        state.value.board[newRow][newCol] === 0
      ) {
        // 交换位置
        [state.value.board[row][col], state.value.board[newRow][newCol]] = 
        [state.value.board[newRow][newCol], state.value.board[row][col]]
        
        state.value.moves++
        checkSolved()
        return true
      }
    }

    return false
  }

  // 检查是否完成
  function checkSolved() {
    const flatBoard = state.value.board.flat()
    state.value.gameStatus = flatBoard.slice(0, -1).every((num, index) => num === index + 1) && 
                          flatBoard[flatBoard.length - 1] === 0 ? 'won' : 'playing'
  }

  // 设置尺寸
  function setSize(newSize: number) {
    state.value.size = newSize
    initBoard()
  }

  // 重置游戏
  function resetGame() {
    state.value.gameStatus = 'waiting'
    state.value.moves = 0
    state.value.board = []
  }

  return {
    size,
    board,
    moves,
    gameStatus,
    initBoard,
    move,
    setSize,
    resetGame
  }
}) 