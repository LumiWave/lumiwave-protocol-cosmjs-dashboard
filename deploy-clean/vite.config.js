import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 브라우저는 같은 오리진(/api/faucet)으로 호출 -> Vite가 외부로 프록시
      "/api/faucet": {
        target: "https://lwp-testnet.lumiwavelab.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/faucet/, "/faucet/"),
      },
    },
  },
})
