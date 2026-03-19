import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/SetupView.vue'
import OptionsView from '@/views/OptionsView.vue'

const router = createRouter({
  // Use Hash History
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/license',
      name: 'license',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LicenseView.vue'),
    },
    {
      path: '/options',
      component: OptionsView,
    },
  ],
})

export default router
