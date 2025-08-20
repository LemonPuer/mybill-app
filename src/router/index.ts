import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/layouts/CommonLayout.vue'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '/',
          name: 'home',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: '/bill',
          name: 'bill',
          component: () => import('@/views/BillView.vue'),
        },
        {
          path: '/manage',
          name: 'manage',
          component: () => import('@/views/manageView.vue'),
        },
      ],
    },
    {
      path: '/login',
      component: () => import('@/views/layouts/LoginLayout.vue'),
      meta: {
        hideHeaderFooter: true,
      },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/views/LoginView.vue'),
        },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
