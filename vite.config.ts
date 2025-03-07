import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts'; // 引入 dts 插件

// https://vite.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'Waterfall',
            fileName: (format) => `waterfall.${format}.js`,
        },
        rollupOptions: {
            external: ['vue'],
        },
        minify: true,
        sourcemap: true,
        target: 'esnext',
    },
    esbuild: {
        tsconfigRaw: {
            compilerOptions: {
                preserveValueImports: true,
                useDefineForClassFields: true,
                target: 'esnext',
            },
        },
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },
    plugins: [
        vue(),
        vueJsx(),
        vueDevTools(),
        cssInjectedByJsPlugin(),
        dts({
            // 添加 dts 插件
            insertTypesEntry: true, // 自动插入类型声明入口文件
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
