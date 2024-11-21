/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue-router' {
  import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router/dist/vue-router'
  export { Router, RouteLocationNormalized, NavigationGuardNext }
  export function createRouter(options: any): Router
  export function createWebHistory(base?: string): any
  export function useRouter(): Router
}

declare module 'pinia'
declare module 'vant' 