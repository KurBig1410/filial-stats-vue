import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [vue()],
// })
export default defineConfig({
  base: "/filial-stats-vue/", // 👈 имя репозитория
  plugins: [vue()],
})