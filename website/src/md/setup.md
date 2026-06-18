# Setup

```
npm i -D vite-plugin-singlefile-compression@latest
```

Then modify `vite.config.ts`, like [website/vite.config.ts](https://github.com/bddjr/vite-plugin-singlefile-compression/blob/main/website/vite.config.ts)

```diff
+ import singleFileCompression from 'vite-plugin-singlefile-compression'

  export default defineConfig({
    plugins: [
      vue(),
      vueDevTools(),
+     singleFileCompression(),
    ],
```

Then use hash history, like [website/src/router/index.ts](https://github.com/bddjr/vite-plugin-singlefile-compression/blob/main/website/src/router/index.ts)

```diff
  const router = createRouter({
-   history: createWebHistory(),
+   history: createWebHashHistory(),
```

To automatically restore the user's scroll position after a page reload or back/forward navigation, add the following code to the end of `src/main.ts`:

```ts
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
```
