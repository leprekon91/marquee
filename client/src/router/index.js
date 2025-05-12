import { createRouter, createWebHistory } from 'vue-router'

// Define your routes here
const routes = [
  {
    path: '/',
    name: 'settings',
    // Lazy loading routes - only loads when the route is visited
    component: () => import('../components/Settings.vue'),
  },
  {
    path: '/display',
    name: 'display',
    component: () => import('../components/Display.vue'),
  },
]

// Create the router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
