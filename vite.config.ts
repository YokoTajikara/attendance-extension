import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				login: resolve(__dirname, 'login.html'),
			},
		},
		outDir: 'dist',
		emptyOutDir: true,
	},
});