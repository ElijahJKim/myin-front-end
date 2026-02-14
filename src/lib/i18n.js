import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

// 1. 언어 파일 등록 (우리가 만든 json 파일 연결)
// 비동기 함수(() => import...)를 써야 필요할 때만 불러와서 빠릅니다.

// 기본 언어 파일 (widget 관련) + landing + campaign 병합
register('en', async () => {
	const [widget, landing, status, register, collab] = await Promise.all([
		import('./lang/en/en_widget.json'),
		import('./lang/en/en_landing.json'),
		import('./lang/en/en_status.json'),
		import('./lang/en/en_register.json'),
		import('./lang/en/en_collab.json')
	]);
	return {
		...widget.default,
		...landing.default,
		...status.default,
		...register.default,
		...collab.default
	};
});

register('ko', async () => {
	const [widget, landing, status, register, collab] = await Promise.all([
		import('./lang/ko/ko_widget.json'),
		import('./lang/ko/ko_landing.json'),
		import('./lang/ko/ko_status.json'),
		import('./lang/ko/ko_register.json'),
		import('./lang/ko/ko_collab.json')
	]);

	return {
		...widget.default,
		...landing.default,
		...status.default,
		...register.default,
		...collab.default
	};
});

register('th', async () => {
	const [widget, landing, status, register, collab] = await Promise.all([
		import('./lang/th/th_widget.json'),
		import('./lang/th/th_landing.json'),
		import('./lang/th/th_status.json'),
		import('./lang/th/th_register.json'),
		import('./lang/th/th_collab.json')
	]);
	return {
		...widget.default,
		...landing.default,
		...status.default,
		...register.default,
		...collab.default
	};
});

register('vi', async () => {
	const [widget, landing, status, register, collab] = await Promise.all([
		import('./lang/vi/vi_widget.json'),
		import('./lang/vi/vi_landing.json'),
		import('./lang/vi/vi_status.json'),
		import('./lang/vi/vi_register.json'),
		import('./lang/vi/vi_collab.json')
	]);
	return {
		...widget.default,
		...landing.default,
		...status.default,
		...register.default,
		...collab.default
	};
});

register('zh', async () => {
	const [widget, landing, status, register, collab] = await Promise.all([
		import('./lang/zh/zh_widget.json'),
		import('./lang/zh/zh_landing.json'),
		import('./lang/zh/zh_status.json'),
		import('./lang/zh/zh_register.json'),
		import('./lang/zh/zh_collab.json')
	]);
	return {
		...widget.default,
		...landing.default,
		...status.default,
		...register.default,
		...collab.default
	};
});
// 2. 초기화 설정
init({
	// 기본 언어 (영어를 기본으로 설정)

	// 현재 브라우저 언어 감지 (예: 한국어 윈도우면 'ko'로 자동 설정)
	// 감지 실패하면 fallbackLocale(en)을 씀
	initialLocale: getLocaleFromNavigator(),
	fallbackLocale: 'en'
});
