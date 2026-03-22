import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/ehon-collection/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'trains/*.webp'],
      manifest: {
        name: 'えほんコレクション',
        short_name: 'えほん',
        description: '絵本を読むと電車が走り出す！子ども向け絵本管理アプリ',
        theme_color: '#1a73e8',
        background_color: '#f0f7ff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
