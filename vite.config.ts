import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Alias removido para evitar erros com __dirname e garantir caminhos relativos padrão
    define: {
      // Isso é CRUCIAL para a Vercel:
      // Substitui 'process.env.API_KEY' pelo valor real da string durante o build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    server: {
      port: 3000
    }
  };
});