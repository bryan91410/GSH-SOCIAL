// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Tailwind v4 (ton fichier est à la racine de src)
import './assets/main.css'
// Si tu l'as mis dans src/assets/main.css, utilise plutôt:
// import './assets/main.css'

const app = createApp(App)

// Pinia (on le garde 👍)
app.use(createPinia())

// Router
app.use(router)

// Mount
app.mount('#app')
