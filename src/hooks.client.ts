import { initLanguage } from '$lib/stores/i18n-stores.svelte.ts';

// 클라이언트에서만 실행 (SSR 회피)
if (typeof window !== 'undefined') {
	initLanguage();
}
