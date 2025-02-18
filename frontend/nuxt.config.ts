export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:8080'  // เชื่อมกับ backend
    }
  },

  compatibilityDate: '2025-02-18'
})