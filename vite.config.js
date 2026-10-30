import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vercel currently stores these as SHOPIFY_* while local Vite uses the
  // VITE_SHOPIFY_* names. Read only these two public Storefront settings and
  // expose them under the names consumed by the existing client.
  const env = loadEnv(mode, process.cwd(), '')
  const shopifyStoreDomain = env.VITE_SHOPIFY_STORE_DOMAIN || env.SHOPIFY_STORE_DOMAIN || ''
  const shopifyStorefrontToken = env.VITE_SHOPIFY_STOREFRONT_TOKEN || env.SHOPIFY_STOREFRONT_TOKEN || ''

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SHOPIFY_STORE_DOMAIN': JSON.stringify(shopifyStoreDomain),
      'import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN': JSON.stringify(shopifyStorefrontToken),
    },
  }
})
