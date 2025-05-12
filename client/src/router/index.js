import { createRouter, createWebHistory } from 'vue-router'
import Display from '../components/Display.vue'

// Define your routes here
const routes = [
  {
    path: '/',
    name: 'display',
    component: Display,
  },
  {
    path: '/settings',
    name: 'settings',
    // Lazy loading routes - only loads when the route is visited
    component: () => import('../components/AboutView.vue'),
  },
]

// Create the router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
