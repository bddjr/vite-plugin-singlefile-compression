import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/SetupView.vue'
import OptionsView from '@/views/OptionsView.vue'
import CloneView from '@/views/CloneView.vue'

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
      path: '/options',
      component: OptionsView,
    },
    {
      path: '/clone',
      component: CloneView,
    },
    {
      path: '/license',
      name: 'license',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LicenseView.vue'),
    },
  ],
})

export default router
