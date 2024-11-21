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

  // 添加 initGame 函数
  function initGame() {
    resetGame()
    state.value.gameStatus = 'waiting'
  }

  // 开始游戏
  function startGame(row: number, col: number) {
    // 先重置游戏状态
    resetGame()
    
    // 确保第一次点击的位置及其周围没有地雷
    const { rows, cols } = state.value.boardSize
    const safeArea = new Set<string>()
    
    // 收集安全区域的坐标（包括点击位置及其周围8个格子）
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i
        const newCol = col + j
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          safeArea.add(`${newRow},${newCol}`)
        }
      }
    }

    // 放置地雷，避开安全区域
    let minesPlaced = 0
    const maxAttempts = rows * cols * 2  // 防止无限循环
    let attempts = 0
    
    while (minesPlaced < state.value.mineCount && attempts < maxAttempts) {
      const mineRow = Math.floor(Math.random() * rows)
      const mineCol = Math.floor(Math.random() * cols)
      const pos = `${mineRow},${mineCol}`
      
      if (!safeArea.has(pos) && !state.value.board[mineRow][mineCol].isMine) {
        state.value.board[mineRow][mineCol].isMine = true
        minesPlaced++
      }
      attempts++
    }

    // 计算每个格子周围的地雷数
    calculateNeighborMines()
    
    // 设置游戏状态为进行中
    state.value.gameStatus = 'playing'
    
    // 揭示第一次点击的格子及其周围的空白区域
    revealCell(row, col)
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

    // 如果是第一次点击，需要初始化地雷
    if (!state.value.board.some(row => row.some(cell => cell.isMine))) {
      // 放置地雷，避开第一次点击的位置及其周围
      const { rows, cols } = state.value.boardSize
      const safeArea = new Set<string>()
      
      // 收集安全区域的坐标
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const newRow = row + i
          const newCol = col + j
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            safeArea.add(`${newRow},${newCol}`)
          }
        }
      }

      // 放置地雷
      let minesPlaced = 0
      const maxAttempts = rows * cols * 2
      let attempts = 0
      
      while (minesPlaced < state.value.mineCount && attempts < maxAttempts) {
        const mineRow = Math.floor(Math.random() * rows)
        const mineCol = Math.floor(Math.random() * cols)
        const pos = `${mineRow},${mineCol}`
        
        if (!safeArea.has(pos) && !state.value.board[mineRow][mineCol].isMine) {
          state.value.board[mineRow][mineCol].isMine = true
          minesPlaced++
        }
        attempts++
      }

      calculateNeighborMines()
    }

    // 继续原来的揭示逻辑
    cell.isRevealed = true
    cell.status = 'revealed'

    if (cell.isMine) {
      state.value.gameStatus = 'lost'
      revealAllMines()
      return
    }

    // 如果是空白格子，自动揭示周围的格子
    if (cell.neighborMines === 0) {
      const { rows, cols } = state.value.boardSize
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const newRow = row + i
          const newCol = col + j
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
    }

    checkWin()
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

  // 揭��所有地雷
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
    // 只有当所有非地雷格子都被揭示，且所有地雷都未被揭示或被正确标记时才算胜利
    const allSafe = state.value.board.every(row =>
      row.every(cell =>
        (cell.isMine && (cell.isFlagged || !cell.isRevealed)) || 
        (!cell.isMine && cell.isRevealed)
      )
    )
    
    if (allSafe) {
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

  // 添加 setGameStatus 函数
  function setGameStatus(status: 'waiting' | 'playing' | 'won' | 'lost') {
    state.value.gameStatus = status
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
    setDifficulty,
    setGameStatus,
    initGame
  }
})

// 导出 store 类型
export type MinesweeperStore = ReturnType<typeof useMinesweeperStore> 