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
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: '/bills',
          name: 'bills',
          component: () => import('@/views/BillView.vue'),
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
        },
        {
          path: '/settings/profile',
          name: 'settings-profile',
          component: () => import('@/views/settings/ProfileView.vue'),
        },
        {
          path: '/settings/notifications',
          name: 'settings-notifications',
          component: () => import('@/views/settings/NotificationSettingsView.vue'),
        },
        {
          path: '/settings/categories',
          name: 'settings-categories',
          component: () => import('@/views/settings/CategoriesView.vue'),
        },
        {
          path: '/settings/budget',
          name: 'settings-budget',
          component: () => import('@/views/settings/BudgetView.vue'),
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
  const accessToken = localStorage.getItem('accessToken')
  const expireTime = localStorage.getItem('expireTime')

  // 检查 token 是否存在且未过期
  const isAuthenticated = accessToken && expireTime && BigInt(Date.now()) < BigInt(expireTime)

  if (to.meta.requiresAuth && !isAuthenticated) {
    // token 不存在或已过期，重定向到登录页
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // 已登录用户访问登录页，重定向到首页
    next('/')
  } else {
    next()
  }
})

export default router
