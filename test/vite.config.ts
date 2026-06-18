import { fileURLToPath, URL } from 'node:url'

import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import singleFileCompression from 'vite-plugin-singlefile-compression'

import markdownit from 'markdown-it'
import highlightjs from 'markdown-it-highlightjs'

function mdToVuePlugin(): Plugin {
  const md = markdownit({
    breaks: true,
    linkify: true,
  })
  md.use(highlightjs, { auto: false })

  return {
    name: 'vite-plugin-md-to-vue',
    transform(code, id) {
      if (/\.md$/i.test(id)) {
        const html = md.render(code).replaceAll('<a href=', '<a target="_blank" href=')
        return `<template>${html}</template>`
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdToVuePlugin(),
    vue({
      include: /\.(vue|md)$/i,
    }),
    vueDevTools(),
    singleFileCompression(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
