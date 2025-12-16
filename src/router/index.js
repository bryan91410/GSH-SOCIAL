import { createRouter, createWebHistory } from 'vue-router'

const Feed     = () => import('@/views/Feed.vue')
const Profile  = () => import('@/views/Profile.vue')
const Login    = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',         name: 'feed',     component: Feed },
    { path: '/profile',  name: 'profile',  component: Profile },
    { path: '/login',    name: 'login',    component: Login },
    { path: '/register', name: 'register', component: Register },
  ],
})

export default router
