import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				//강제로 오류 무시 인데 나중에 다시와서 고쳐볼것
				silenceDeprecations: ['legacy-js-api', 'import'],
				quietDeps: true,
				additionalData: `
                    @import "${path.resolve(process.cwd(), 'src/styles/_mixin.scss')}";
                    @import "${path.resolve(process.cwd(), 'src/styles/_responsive.scss')}"; 
                    @import "${path.resolve(process.cwd(), 'src/styles/_colors.scss')}";
					@import "${path.resolve(process.cwd(), 'src/styles/_typography.scss')}";
				
                `
			}
		}
	}
});
