import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      Components({
        resolvers: [
          IconsResolver({
            prefix: 'icon'
          }),
        ],
      }),
      Icons(),
    ],
    base: mode === 'production' ? '/tiptap-comment-extension/' : '/'
  }
})
