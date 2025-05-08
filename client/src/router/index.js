import { createRouter, createWebHistory } from 'vue-router'
import ExampleComponent from '../components/ExampleComponent.vue'

// Define your routes here
const routes = [
  {
    path: '/',
    name: 'home',
    component: ExampleComponent,
  },
  {
    path: '/about',
    name: 'about',
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
