/// <reference types="vite/client" />

declare module '*.md' {
    import { Component } from 'vue'
    const component: Component
    export default component
}