import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      dts: 'src/auto-imports.d.ts',
      resolvers: [NaiveUiResolver()],
    }),
    Components({
      dts: 'src/components.d.ts',
      resolvers: [NaiveUiResolver()],
      defaultExport: 'auto',
    }),
  ],
});
