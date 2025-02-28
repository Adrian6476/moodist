import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  server: {
    host: '0.0.0.0',  // 允许局域网访问
    port: 3000        // 指定端口号
  }
});
