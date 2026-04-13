import { createRouter, createWebHistory } from 'vue-router'

// Lazy-loading des pages principales
const Fil = () => import('@/views/Fil.vue')
const Profil = () => import('@/views/Profil.vue')
const Connexion = () => import('@/views/Connexion.vue')
const Inscription = () => import('@/views/Inscription.vue')
const MotDePasseOublie = () => import('@/views/MotDePasseOublie.vue')
const ReinitialiserMotDePasse = () => import('@/views/ReinitialiserMotDePasse.vue')
const Conversations = () => import('@/views/Conversations.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/fil' },
    { path: '/fil', name: 'fil', component: Fil, meta: { requiresAuth: true } },
    { path: '/profil', name: 'profil', component: Profil, meta: { requiresAuth: true } },
    { path: '/conversations', name: 'conversations', component: Conversations, meta: { requiresAuth: true } },
    { path: '/connexion', name: 'connexion', component: Connexion },
    { path: '/inscription', name: 'inscription', component: Inscription },
    { path: '/mot-de-passe-oublie', name: 'mot-de-passe-oublie', component: MotDePasseOublie },
    { path: '/reinitialiser-mot-de-passe', name: 'reinitialiser-mot-de-passe', component: ReinitialiserMotDePasse },
  ],
})

export default router
