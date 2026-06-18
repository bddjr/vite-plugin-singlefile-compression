import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Restore scroll position after page reload or back/forward navigation
{
  const storageKey = 'globalScrollXY'
  const item = sessionStorage.getItem(storageKey)
  if (item !== null) {
    try {
      sessionStorage.removeItem(storageKey)
      const navEntry = self.performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined
      const navType = navEntry?.type
      if (navType === 'reload' || navType === 'back_forward') {
        const [x, y] = item.split(',', 2)
        setTimeout(() => {
          self.scrollTo({
            left: Number(x),
            top: Number(y),
            behavior: 'instant',
          })
        }, 1)
      }
    } catch (e) {
      console.error(e)
    }
  }
  const saveScrollPosition = () => {
    sessionStorage.setItem(storageKey, `${self.scrollX},${self.scrollY}`)
  }
  self.addEventListener('pagehide', saveScrollPosition)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveScrollPosition()
  })
}

console.log(import.meta)
console.log(import.meta.resolve('./'))
