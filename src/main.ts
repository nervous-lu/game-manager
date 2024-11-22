import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router'

// 导入 Vant
import { 
  Button,
  Icon,
  Dialog,
  RadioGroup,
  Radio
} from 'vant'

// 导入 Vant 样式
import 'vant/lib/index.css'

const app = createApp(App)
const pinia = createPinia()

// 注册 Vant 组件
app.use(Button)
app.use(Icon)
app.use(Dialog)
app.use(RadioGroup)
app.use(Radio)

app.use(pinia)
app.use(router)
app.mount('#app')
