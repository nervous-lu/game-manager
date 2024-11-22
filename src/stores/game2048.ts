import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Game2048State {
  board: number[][]
  score: number
  bestScore: number
  gameStatus: 'waiting' | 'playing' | 'won' | 'lost'
}

export const useGame2048Store = defineStore('game2048', () => {
  const state = ref<Game2048State>({
    board: Array(4).fill(0).map(() => Array(4).fill(0)),
    score: 0,
    bestScore: 0,
    gameStatus: 'waiting'
  })

  function initBoard() {
    state.value.board = Array(4).fill(0).map(() => Array(4).fill(0))
    addNewTile()
    addNewTile()
    state.value.score = 0
    state.value.gameStatus = 'playing'
  }

  function addNewTile() {
    const emptyCells = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (state.value.board[i][j] === 0) {
          emptyCells.push({ x: i, y: j })
        }
      }
    }
    if (emptyCells.length > 0) {
      const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      state.value.board[x][y] = Math.random() < 0.9 ? 2 : 4
    }
  }

  function move(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    if (state.value.gameStatus !== 'playing') return false

    const oldBoard = JSON.stringify(state.value.board)
    const board = state.value.board

    // 移动和合并逻辑
    let moved = false
    if (direction === 'left' || direction === 'right') {
      for (let i = 0; i < 4; i++) {
        const row = board[i].filter(cell => cell !== 0)
        if (direction === 'right') row.reverse()

        // 合并相同的数字
        for (let j = 0; j < row.length - 1; j++) {
          if (row[j] === row[j + 1]) {
            row[j] *= 2
            state.value.score += row[j]
            row.splice(j + 1, 1)
          }
        }

        // 补充0
        while (row.length < 4) {
          direction === 'left' ? row.push(0) : row.unshift(0)
        }

        if (direction === 'right') row.reverse()
        board[i] = row
      }
    } else {
      for (let j = 0; j < 4; j++) {
        let col = board.map(row => row[j]).filter(cell => cell !== 0)
        if (direction === 'down') col.reverse()

        // 合并相同的数字
        for (let i = 0; i < col.length - 1; i++) {
          if (col[i] === col[i + 1]) {
            col[i] *= 2
            state.value.score += col[i]
            col.splice(i + 1, 1)
          }
        }

        // 补充0
        while (col.length < 4) {
          direction === 'up' ? col.push(0) : col.unshift(0)
        }

        if (direction === 'down') col.reverse()
        for (let i = 0; i < 4; i++) {
          board[i][j] = col[i]
        }
      }
    }

    moved = oldBoard !== JSON.stringify(board)
    if (moved) {
      addNewTile()
      checkGameStatus()
    }

    return moved
  }

  function checkGameStatus() {
    // 检查是否达到2048
    if (state.value.board.some(row => row.some(cell => cell === 2048))) {
      state.value.gameStatus = 'won'
      if (state.value.score > state.value.bestScore) {
        state.value.bestScore = state.value.score
      }
      return
    }

    // 检查是否还有空格
    if (state.value.board.some(row => row.some(cell => cell === 0))) {
      return
    }

    // 检查是否还能移动
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = state.value.board[i][j]
        if ((i < 3 && current === state.value.board[i + 1][j]) ||
            (j < 3 && current === state.value.board[i][j + 1])) {
          return
        }
      }
    }

    state.value.gameStatus = 'lost'
    if (state.value.score > state.value.bestScore) {
      state.value.bestScore = state.value.score
    }
  }

  function resetGame() {
    state.value.gameStatus = 'waiting'
    state.value.board = Array(4).fill(0).map(() => Array(4).fill(0))
    state.value.score = 0
  }

  return {
    board: computed(() => state.value.board),
    score: computed(() => state.value.score),
    bestScore: computed(() => state.value.bestScore),
    gameStatus: computed(() => state.value.gameStatus),
    initBoard,
    move,
    resetGame
  }
}) 