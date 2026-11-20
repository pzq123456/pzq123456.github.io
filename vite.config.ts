import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import path from 'path'

// https://vite.dev/config/

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        jsxImportSource: 'react',
        remarkPlugins: [remarkMath, remarkGfm],
        rehypePlugins: [
          [rehypeKatex, { throwOnError: false }],
          [
            rehypePrettyCode,
            {
              // Shiki emits both palettes as CSS variables; the site picks one.
              theme: {
                light: 'vitesse-light',
                dark: 'vitesse-dark',
              },
              // The site owns the code-block frame; only token colours come from Shiki.
              keepBackground: false,
            },
          ],
        ],
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