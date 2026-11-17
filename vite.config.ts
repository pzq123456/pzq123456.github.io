import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import path from 'path'

// https://vite.dev/config/

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        jsxImportSource: 'react',
        remarkPlugins: [remarkMath],
        rehypePlugins: [[rehypeKatex, { throwOnError: false }]],
      }),
    },
    react(),
    tailwindcss(),
  ],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
})