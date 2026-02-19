import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import process from 'node:process'

// https://vite.dev/config/
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyPath = (env.VITE_FAUCET_PROXY_PATH || '/api/faucet').replace(/\/$/, '')
  const proxyTarget = env.VITE_FAUCET_PROXY_TARGET || 'https://lwp-testnet.lumiwavelab.com'
  const proxyRewrite = env.VITE_FAUCET_PROXY_REWRITE || '/faucet/'
  const proxyPathPattern = new RegExp(`^${escapeRegExp(proxyPath)}`)

  return {
    plugins: [react()],
    server: {
      proxy: {
        [proxyPath]: {
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith('https://'),
          rewrite: (path) => path.replace(proxyPathPattern, proxyRewrite),
        },
      },
    },
  }
})
