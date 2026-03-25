import './assets/styles/base.css'
import './assets/styles/main.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

// 主题变量需要在 Element Plus 样式之后引入
import './assets/styles/theme.css'

import App from './App.vue'
import router from './router'
import { initTheme } from './utils/themeUtil'

const app = createApp(App)

// 初始化主题
initTheme()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')
