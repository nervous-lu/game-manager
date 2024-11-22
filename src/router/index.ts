import { createRouter, createWebHistory } from 'vue-router'
import { showDialog } from 'vant'
import Home from '@/views/Home.vue'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/minesweeper',
      name: 'Minesweeper',
      component: () => import('@/views/Minesweeper.vue')
    },
    {
      path: '/gobang',
      name: 'Gobang', 
      component: () => import('@/views/Gobang.vue')
    },
    {
      path: '/undercover',
      name: 'Undercover',
      component: () => import('@/views/Undercover.vue')
    },
    {
      path: '/puzzle',
      name: 'Puzzle',
      component: () => import('@/views/Puzzle.vue')
    },
    {
      path: '/game2048',
      name: 'Game2048',
      component: () => import('@/views/Game2048.vue')
    },
    {
      path: '/memory',
      name: 'Memory',
      component: () => import('@/views/Memory.vue')
    },
    {
      path: '/jump',
      name: 'Jump',
      component: () => import('@/views/Jump.vue')
    }
  ]
})

// 全局导航守卫
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  // 如果是从主页来的或者去主页的，直接通过
  if (from.name === 'Home' || to.name === 'Home') {
    next()
    return
  }

  // 根据当前路由获取对应的 store
  let store = null
  switch (from.name) {
    case 'Minesweeper':
      const { useMinesweeperStore } = await import('@/stores/minesweeper')
      store = useMinesweeperStore()
      break
    case 'Gobang':
      const { useGobangStore } = await import('@/stores/gobang')
      store = useGobangStore()
      break
    case 'Undercover':
      const { useUndercoverStore } = await import('@/stores/undercover')
      store = useUndercoverStore()
      break
    case 'Puzzle':
      const { usePuzzleStore } = await import('@/stores/puzzle')
      store = usePuzzleStore()
      break
    case 'Game2048':
      const { useGame2048Store } = await import('@/stores/game2048')
      store = useGame2048Store()
      break
    case 'Memory':
      const { useMemoryStore } = await import('@/stores/memory')
      store = useMemoryStore()
      break
  }

  // 如果找到了 store 并且游戏正在进行中，则进行确认
  if (store && store.gameStatus === 'playing') {
    try {
      await showDialog({
        title: '确认退出',
        message: '当前游戏进度将丢失，确定要退出吗？',
        confirmButtonText: '确认退出',
        cancelButtonText: '继续游戏',
        theme: 'round-button'
      })
      store.resetGame()
      next()
    } catch {
      next(false)
    }
  } else {
    next()
  }
})

export default router 