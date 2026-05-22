import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/trace/:code',
      name: 'Trace',
      component: () => import('@/views/TracePage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/trace/invalid',
    },
  ],
})

export default router
