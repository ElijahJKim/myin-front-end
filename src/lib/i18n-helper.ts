//이 함수는 현재 선택된 언어에 따라 더 쉽게 메시지를 반환하는 함수입니다.
//예시: t('campaign.register_title')
//긴 경로를 입력하지 않아도 됨
//타입 안전성 (TypeScript)
//못 찾은 값은 path 자체를 반환해서 디버깅 쉬움

import { globalState } from './stores/i18n-stores.svelte.ts';

export function t<T = string>(path: string): T {
	const keys = path.split('.');
	let value: any = globalState.messages;

	for (const key of keys) {
		value = value?.[key];
	}

	return value || (path as T);
}
