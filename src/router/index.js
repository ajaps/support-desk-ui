import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/',        redirect: '/tickets' },
  { path: '/login',   component: () => import('@/views/Auth.vue') },

  // Both roles hit the same views — the view reads auth.isAgent to adapt
  {
    path: '/tickets',
    component: () => import('@/views/TicketList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tickets/new',
    component: () => import('@/views/CreateTicket.vue'),
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/tickets/:id',
    component: () => import('@/views/TicketDetail.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  console.log('Guard:', {
    path: to.path,
    isAuthenticated: auth.isAuthenticated,
    role: auth.user?.role,
    isCustomer: auth.isCustomer,
    isAgent: auth.isAgent,
  })
  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login'
  if (to.meta.role === 'customer' && !auth.isCustomer) return '/tickets'
})

export default router