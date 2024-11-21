import { defineStore } from 'pinia'
import { reactive, toRefs, computed } from 'vue'

interface WordPair {
  common: string
  undercover: string
}

interface Player {
  id: number
  word: string
  isUndercover: boolean
  isEliminated: boolean
  viewed: boolean
  votes: number
}

interface UndercoverState {
  wordPairs: WordPair[]
  players: Player[]
  currentWordPair: WordPair | null
  playerCount: number
  currentViewingPlayer: number
  gameStarted: boolean
  gameEnded: boolean
  playerOptions: number[]
  votingRound: number
  gameStatus: 'waiting' | 'playing' | 'won'
}

export const useUndercoverStore = defineStore('undercover', () => {
  const state = reactive<UndercoverState>({
    wordPairs: [
      {common: '苹果', undercover: '梨子'},
      {common: '猫', undercover: '狗'},
      {common: '太阳', undercover: '月亮'},
      {common: '足球', undercover: '篮球'},
      {common: '沙发', undercover: '椅子'},
      {common: '飞机', undercover: '火车'},
      {common: '铅笔', undercover: '钢笔'},
      {common: '桌子', undercover: '床'},
      {common: '眼镜', undercover: '墨镜'},
      {common: '草莓', undercover: '樱桃'},
      {common: '洗衣机', undercover: '烘干机'},
      {common: '饺子', undercover: '包子'},
      {common: '书包', undercover: '手提包'},
      {common: '雪', undercover: '雨'},
      {common: '台灯', undercover: '吊灯'},
      {common: '饼干', undercover: '蛋糕'},
      {common: '河流', undercover: '湖泊'},
      {common: '红茶', undercover: '绿茶'},
      {common: '巧克力', undercover: '糖果'},
      {common: '镜子', undercover: '玻璃'},
      {common: '手机', undercover: '平板'},
      {common: '公园', undercover: '游乐场'},
      {common: '牛奶', undercover: '豆浆'},
      {common: '树', undercover: '草'},
      {common: '西瓜', undercover: '哈密瓜'},
      {common: '电影', undercover: '电视剧'},
      {common: '冰箱', undercover: '空调'},
      {common: '电梯', undercover: '楼梯'},
      {common: '帽子', undercover: '头盔'},
      {common: '牙膏', undercover: '牙刷'},
      {common: '茶壶', undercover: '咖啡杯'},
      {common: '地图', undercover: '指南针'},
      {common: '花', undercover: '草'},
      {common: '电风扇', undercover: '空调'},
      {common: '袜子', undercover: '手套'},
      {common: '蛋炒饭', undercover: '扬州炒饭'},
      {common: '手表', undercover: '时钟'},
      {common: '船', undercover: '潜水艇'},
      {common: '音乐', undercover: '舞蹈'},
      {common: '面包', undercover: '蛋糕'},
      {common: '河马', undercover: '犀牛'},
      {common: '长城', undercover: '故宫'},
      {common: '风筝', undercover: '飞机'},
      {common: '火锅', undercover: '烧烤'},
      {common: '书', undercover: '杂志'},
      {common: '山', undercover: '丘陵'},
      {common: '葡萄', undercover: '蓝莓'},
      {common: '电视', undercover: '电脑'},
      {common: '蜂蜜', undercover: '糖浆'},
      {common: '咖啡', undercover: '奶茶'},
      {common: '摩托车', undercover: '电动车'},
      {common: '台风', undercover: '龙卷风'},
      {common: '钥匙', undercover: '密码'},
      {common: '枕头', undercover: '抱枕'},
      {common: '饼', undercover: '馒头'},
      {common: '香水', undercover: '花露水'},
      {common: '钢琴', undercover: '吉他'},
      {common: '山羊', undercover: '绵羊'},
      {common: '冰淇淋', undercover: '雪糕'},
      {common: '公交车', undercover: '地铁'},
      {common: '月饼', undercover: '汤圆'},
      {common: '书法', undercover: '绘画'},
      {common: '手电筒', undercover: '蜡烛'},
      {common: '雨伞', undercover: '雨衣'},
      {common: '熊猫', undercover: '北极熊'},
      {common: '山竹', undercover: '榴莲'},
      {common: '草原', undercover: '沙漠'},
      {common: '笔记本', undercover: '平板电脑'},
      {common: '水杯', undercover: '碗'},
      {common: '乌龟', undercover: '鳄鱼'},
      {common: '白云', undercover: '浓雾'},
      {common: '手机壳', undercover: '屏幕贴膜'},
      {common: '辣椒', undercover: '青椒'},
      {common: '跑步', undercover: '快走'},
      {common: '围巾', undercover: '领带'},
      {common: '台阶', undercover: '扶梯'},
      {common: '剪刀', undercover: '美工刀'},
      {common: '脸盆', undercover: '浴缸'},
      {common: '白酒', undercover: '啤酒'},
      {common: '啤酒', undercover: '果酒'},
      {common: '手机', undercover: '电话'},
      {common: '粉笔', undercover: '白板笔'},
      {common: '榴莲', undercover: '菠萝蜜'},
      {common: '鸡肉', undercover: '鸭肉'},
      {common: '小提琴', undercover: '大提琴'},
      {common: '超市', undercover: '菜市场'},
      {common: '电脑', undercover: '服务器'},
      {common: '饭店', undercover: '快餐店'},
      {common: '石头', undercover: '鹅卵石'},
      {common: '棒球', undercover: '垒球'},
      {common: '树叶', undercover: '草叶'},
      {common: '剪刀', undercover: '刀'},
      {common: '猴子', undercover: '猩猩'},
      {common: '手链', undercover: '项链'},
      {common: '画画', undercover: '书法'},
      {common: '打火机', undercover: '火柴'},
      {common: '手电筒', undercover: '头灯'}
    ],
    players: [],
    currentWordPair: null,
    playerCount: 3,
    currentViewingPlayer: -1,
    gameStarted: false,
    gameEnded: false,
    playerOptions: [3, 4, 5, 6, 7, 8],
    votingRound: 0,
    gameStatus: 'waiting'
  })

  const remainingPlayers = computed(() => 
    state.players.filter((player: Player) => !player.isEliminated)
  )
  
  const isGameOver = computed(() => {
    const remaining = state.players.filter((player: Player) => !player.isEliminated)
    const undercoverCount = remaining.filter((player: Player) => player.isUndercover).length
    const civilianCount = remaining.length - undercoverCount
    return undercoverCount === civilianCount || undercoverCount === 0
  })
  
  const winner = computed(() => {
    const remaining = state.players.filter((player: Player) => !player.isEliminated)
    const undercoverCount = remaining.filter((player: Player) => player.isUndercover).length
    return undercoverCount === 0 ? '平民胜利！' : '卧底胜利！'
  })
  
  const allPlayersViewed = computed(() => 
    state.players.every((player: Player) => player.viewed)
  )

  function startGame() {
    state.gameStarted = true
    state.gameEnded = false
    state.currentWordPair = state.wordPairs[Math.floor(Math.random() * state.wordPairs.length)]
    state.players = []
    
    const undercoverId = Math.floor(Math.random() * state.playerCount)
    
    for (let i = 0; i < state.playerCount; i++) {
      state.players.push({
        id: i,
        word: i === undercoverId ? state.currentWordPair!.undercover : state.currentWordPair!.common,
        isUndercover: i === undercoverId,
        isEliminated: false,
        viewed: false,
        votes: 0
      })
    }
    
    state.currentViewingPlayer = -1
    state.votingRound = 0
    state.gameStatus = 'playing'
  }

  function viewCard(playerId: number) {
    state.currentViewingPlayer = playerId
  }

  function hideCard() {
    state.currentViewingPlayer = -1
  }

  function eliminatePlayer(playerId: number) {
    const player = state.players.find((player: Player) => player.id === playerId)
    if (player) {
      player.votes++
      
      const remainingPlayers = state.players.filter((player: Player) => !player.isEliminated)
      const maxVotes = Math.max(...remainingPlayers.map((player: Player) => player.votes))
      const playersWithMaxVotes = remainingPlayers.filter((player: Player) => player.votes === maxVotes)
      
      if (playersWithMaxVotes.length === 1 && maxVotes >= remainingPlayers.length / 2) {
        playersWithMaxVotes[0].isEliminated = true
        state.votingRound++
        
        state.players.forEach((player: Player) => player.votes = 0)
        
        if (isGameOver.value) {
          state.gameEnded = true
        }
      }
    }
  }

  function resetGame() {
    state.gameStarted = false
    state.gameEnded = false
    state.players = []
    state.currentWordPair = null
    state.currentViewingPlayer = -1
    state.votingRound = 0
    state.gameStatus = 'waiting'
  }

  function markPlayerViewed(playerId: number) {
    const player = state.players.find((player: Player) => player.id === playerId)
    if (player) {
      player.viewed = true
    }
  }

  return {
    ...toRefs(state),
    remainingPlayers,
    isGameOver,
    winner,
    allPlayersViewed,
    startGame,
    viewCard,
    hideCard,
    eliminatePlayer,
    resetGame,
    markPlayerViewed,
    gameStatus: computed(() => state.gameStatus)
  }
})