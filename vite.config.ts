import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/detectResolution.ts'),
        popup: resolve(__dirname, 'src/popup/popup.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'popup') return 'popup/popup.js'
          if (chunkInfo.name === 'background') return 'background.js'
          if (chunkInfo.name === 'content') return 'content.js'
          return 'assets/[name].js'
        },
        assetFileNames: (assetInfo) => {
          if (
            assetInfo.name &&
            assetInfo.name.endsWith('.css') &&
            assetInfo.name.includes('popup')
          ) {
            return 'popup/[name][extname]'
          }
          return 'assets/[name][extname]'
        },
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: 'assets', dest: '.' }
      ]
    })
  ]
})
