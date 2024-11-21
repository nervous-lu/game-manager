import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type CellStatus = 'hidden' | 'revealed' | 'flagged'
type Difficulty = 'easy' | 'medium' | 'hard'
type GameStatus = 'waiting' | 'playing' | 'won' | 'lost'

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
  status: CellStatus
}

interface MinesweeperState {
  board: Cell[][]
  difficulty: Difficulty
  gameStatus: GameStatus
  boardSize: { rows: number; cols: number }
  mineCount: number
  remainingMines: number
}

const DIFFICULTY_SETTINGS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 30, cols: 16, mines: 99 }
} as const

export const useMinesweeperStore = defineStore('minesweeper', () => {
  const state = ref<MinesweeperState>({
    board: [],
    difficulty: 'easy',
    gameStatus: 'waiting',
    boardSize: DIFFICULTY_SETTINGS.easy,
    mineCount: DIFFICULTY_SETTINGS.easy.mines,
    remainingMines: DIFFICULTY_SETTINGS.easy.mines
  })

  // 计算属性
  const isGameOver = computed(() => 
    state.value.gameStatus === 'won' || state.value.gameStatus === 'lost'
  )

  // 初始化游戏
  function resetGame() {
    const settings = DIFFICULTY_SETTINGS[state.value.difficulty]
    state.value.board = Array(settings.rows).fill(null).map(() =>
      Array(settings.cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
        status: 'hidden' as CellStatus
      }))
    )
    state.value.boardSize = settings
    state.value.mineCount = settings.mines
    state.value.remainingMines = settings.mines
    state.value.gameStatus = 'waiting'
  }

  // 开始游戏
  function startGame(row: number, col: number) {
    placeMines(row, col)
    calculateNeighborMines()
    state.value.gameStatus = 'playing'
  }

  // 放置地雷
  function placeMines(firstRow: number, firstCol: number) {
    const { rows, cols } = state.value.boardSize
    const minePositions = new Set<string>()
    
    while (minePositions.size < state.value.mineCount) {
      const row = Math.floor(Math.random() * rows)
      const col = Math.floor(Math.random() * cols)
      const pos = `${row},${col}`
      
      // 确保第一次点击的位置及其周围没有地雷
      if (
        Math.abs(row - firstRow) <= 1 && 
        Math.abs(col - firstCol) <= 1
      ) continue
      
      if (!minePositions.has(pos)) {
        minePositions.add(pos)
        state.value.board[row][col].isMine = true
      }
    }
  }

  // 计算周围地雷数
  function calculateNeighborMines() {
    const { rows, cols } = state.value.boardSize
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (state.value.board[row][col].isMine) continue

        let count = 0
        for (const [dx, dy] of directions) {
          const newRow = row + dx
          const newCol = col + dy
          if (
            newRow >= 0 && newRow < rows &&
            newCol >= 0 && newCol < cols &&
            state.value.board[newRow][newCol].isMine
          ) {
            count++
          }
        }
        state.value.board[row][col].neighborMines = count
      }
    }
  }

  // 揭示格子
  function revealCell(row: number, col: number) {
    const cell = state.value.board[row][col]
    if (cell.isRevealed || cell.isFlagged || state.value.gameStatus !== 'playing') return

    cell.isRevealed = true
    cell.status = 'revealed'

    if (cell.isMine) {
      state.value.gameStatus = 'lost'
      revealAllMines()
      return
    }

    if (cell.neighborMines === 0) {
      revealNeighbors(row, col)
    }

    checkWin()
  }

  // 揭示周围格子
  function revealNeighbors(row: number, col: number) {
    const { rows, cols } = state.value.boardSize
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]

    for (const [dx, dy] of directions) {
      const newRow = row + dx
      const newCol = col + dy
      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !state.value.board[newRow][newCol].isRevealed &&
        !state.value.board[newRow][newCol].isFlagged
      ) {
        revealCell(newRow, newCol)
      }
    }
  }

  // 标记地雷
  function toggleFlag(row: number, col: number) {
    const cell = state.value.board[row][col]
    if (cell.isRevealed || state.value.gameStatus !== 'playing') return

    if (cell.isFlagged) {
      cell.isFlagged = false
      cell.status = 'hidden'
      state.value.remainingMines++
    } else {
      cell.isFlagged = true
      cell.status = 'flagged'
      state.value.remainingMines--
    }
  }

  // 揭示所有地雷
  function revealAllMines() {
    state.value.board.forEach(row => {
      row.forEach(cell => {
        if (cell.isMine) {
          cell.isRevealed = true
          cell.status = 'revealed'
        }
      })
    })
  }

  // 检查是否胜利
  function checkWin() {
    const allNonMinesRevealed = state.value.board.every(row =>
      row.every(cell => cell.isMine || cell.isRevealed)
    )
    
    if (allNonMinesRevealed) {
      state.value.gameStatus = 'won'
      // 自动标记所有未标记的地雷
      state.value.board.forEach(row => {
        row.forEach(cell => {
          if (cell.isMine && !cell.isFlagged) {
            cell.isFlagged = true
            cell.status = 'flagged'
          }
        })
      })
      state.value.remainingMines = 0
    }
  }

  // 添加 setDifficulty 函数
  function setDifficulty(difficulty: Difficulty) {
    state.value.difficulty = difficulty
    resetGame()
  }

  return {
    board: computed(() => state.value.board),
    difficulty: computed(() => state.value.difficulty),
    gameStatus: computed(() => state.value.gameStatus),
    boardSize: computed(() => state.value.boardSize),
    remainingMines: computed(() => state.value.remainingMines),
    isGameOver,
    resetGame,
    startGame,
    revealCell,
    toggleFlag,
    setDifficulty
  }
})

// 导出 store 类型
export type MinesweeperStore = ReturnType<typeof useMinesweeperStore> 