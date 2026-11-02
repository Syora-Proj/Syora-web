import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Canonical name: VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN (matches Shopify's own
  // "Storefront API access token" naming and what's configured in Vercel).
  // Vercel sometimes stores the server-side alias without the VITE_ prefix, so
  // both are checked here and exposed under the one name the client actually reads.
  const env = loadEnv(mode, process.cwd(), '')
  const shopifyStoreDomain = env.VITE_SHOPIFY_STORE_DOMAIN || env.SHOPIFY_STORE_DOMAIN || ''
  const shopifyStorefrontToken = env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || ''

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SHOPIFY_STORE_DOMAIN': JSON.stringify(shopifyStoreDomain),
      'import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN': JSON.stringify(shopifyStorefrontToken),
    },
  }
})
