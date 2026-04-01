import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import ScreenLayout from '@/layouts/ScreenLayout.vue'
import { menuConfig, type MenuItemConfig } from './menu'
import { getStoredToken } from '@/stores/auth'

function flattenRoutes(items: MenuItemConfig[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []
  for (const item of items) {
    if (item.path && item.component) {
      routes.push({
        path: item.path,
        name: item.path.replace(/\//g, '-'),
        meta: { title: item.label },
        component: item.component,
      })
    }
    if (item.children) {
      routes.push(...flattenRoutes(item.children))
    }
  }
  return routes
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
    },
    {
      path: '/screen',
      component: ScreenLayout,
      meta: { title: '数据大屏' },
      children: [
        {
          path: '',
          name: 'screen',
          component: () => import('@/views/screen/BigScreenView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: MainLayout,
      redirect: '/dashboard',
      children: [
        ...flattenRoutes(menuConfig),
        {
          path: 'base/cow/farmer/:farmerId',
          name: 'base-cow-farmer',
          meta: { title: '户内奶牛档案' },
          component: () => import('@/views/base/CowFarmerDetailView.vue'),
        },
        {
          path: 'base/region/township/:townshipId',
          name: 'base-region-township',
          meta: { title: '行政村管理' },
          component: () => import('@/views/base/RegionTownshipView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const token = getStoredToken()

  if (to.path === '/login') {
    if (token) return '/dashboard'
    return true
  }

  if (!token) {
    return '/login'
  }

  return true
})

export default router
