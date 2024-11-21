import { defineStore } from 'pinia'
import { reactive, toRefs, computed } from 'vue'

export type ChessType = 0 | 1 | 2  // 0: 空, 1: 黑棋, 2: 白棋
export type GameStatus = 'waiting' | 'playing' | 'won'

interface Position {
  x: number
  y: number
}

interface GobangState {
  board: ChessType[][]
  currentPlayer: 1 | 2
  winner: 0 | 1 | 2
  blackTime: number
  whiteTime: number
  startTime: number
  lastMoveTime: number
  gameStatus: GameStatus
}

export const useGobangStore = defineStore('gobang', () => {
  const state = reactive<GobangState>({
    board: Array(15).fill(0).map(() => Array(15).fill(0)),
    currentPlayer: 1,
    winner: 0,
    blackTime: 0,
    whiteTime: 0,
    startTime: Date.now(),
    lastMoveTime: Date.now(),
    gameStatus: 'waiting'
  })

  function startGame() {
    state.board = Array(15).fill(0).map(() => Array(15).fill(0))
    state.currentPlayer = 1
    state.gameStatus = 'playing'
    state.winner = 0
    state.blackTime = 0
    state.whiteTime = 0
    state.startTime = Date.now()
    state.lastMoveTime = Date.now()
  }

  function updateTime() {
    const now = Date.now()
    const elapsed = now - state.lastMoveTime
    if (state.currentPlayer === 1) {
      state.blackTime += elapsed
    } else {
      state.whiteTime += elapsed
    }
    state.lastMoveTime = now
  }

  function makeMove(x: number, y: number): boolean {
    if (state.gameStatus !== 'playing' || state.board[y][x] !== 0) {
      return false
    }

    updateTime()
    state.board[y][x] = state.currentPlayer
    
    if (checkWin({ x, y })) {
      state.winner = state.currentPlayer
      state.gameStatus = 'won'
      return true
    }

    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1
    return true
  }

  function checkWin(pos: Position): boolean {
    const directions = [
      [[0, 1], [0, -1]],   // 垂直
      [[1, 0], [-1, 0]],   // 水平
      [[1, 1], [-1, -1]],  // 主对角线
      [[1, -1], [-1, 1]]   // 副对角线
    ]

    for (const direction of directions) {
      let count = 1
      for (const [dx, dy] of direction) {
        let x = pos.x + dx
        let y = pos.y + dy
        while (
          x >= 0 && x < 15 && 
          y >= 0 && y < 15 && 
          state.board[y][x] === state.currentPlayer
        ) {
          count++
          x += dx
          y += dy
        }
      }
      if (count >= 5) return true
    }
    return false
  }

  function resetGame() {
    state.gameStatus = 'waiting'
    state.board = Array(15).fill(0).map(() => Array(15).fill(0))
    state.currentPlayer = 1
    state.winner = 0
    state.blackTime = 0
    state.whiteTime = 0
    state.startTime = Date.now()
    state.lastMoveTime = Date.now()
  }

  return {
    ...toRefs(state),
    startGame,
    updateTime,
    makeMove,
    checkWin,
    resetGame,
    gameStatus: computed(() => state.gameStatus)
  }
}) 