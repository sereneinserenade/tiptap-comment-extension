import { defineConfig, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import eslintPlugin from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config: UserConfigExport = {
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

  if (mode !== 'development') config.plugins?.push(eslintPlugin())

  return config
})
