import { locale } from 'svelte-i18n';

export const globalState = $state({
	currentLanguage: 'ko',
	messages: null as Record<string, any> | null // 불러온 JSON 데이터가 여기 들어갑니다
});

export async function setLanguage(lang: string) {
	locale.set(lang);

	globalState.currentLanguage = lang;

	if (typeof window !== 'undefined') {
		localStorage.setItem('selectedLanguage', lang);
	}

	let msg;

	if (lang === 'ko') {
		const [widget, landing, status, register, collab] = await Promise.all([
			import('../lang/ko/ko_widget.json'),
			import('../lang/ko/ko_landing.json'),
			import('../lang/ko/ko_status.json'),
			import('../lang/ko/ko_register.json'),
			import('../lang/ko/ko_collab.json')
		]);

		msg = {
			...widget.default,
			...landing.default,
			...status.default,
			...register.default,
			...collab.default
		};
	} else if (lang === 'en') {
		const [widget, landing, status, register, collab] = await Promise.all([
			import('../lang/en/en_widget.json'),
			import('../lang/en/en_landing.json'),
			import('../lang/en/en_status.json'),
			import('../lang/en/en_register.json'),
			import('../lang/en/en_collab.json')
		]);
		msg = {
			...widget.default,
			...landing.default,
			...status.default,
			...register.default,
			...collab.default
		};
	} else if (lang === 'zh') {
		const [widget, landing, status, register, collab] = await Promise.all([
			import('../lang/zh/zh_widget.json'),
			import('../lang/zh/zh_landing.json'),
			import('../lang/zh/zh_status.json'),
			import('../lang/zh/zh_register.json'),
			import('../lang/zh/zh_collab.json')
		]);
		msg = {
			...widget.default,
			...landing.default,
			...status.default,
			...register.default,
			...collab.default
		};
	} else if (lang === 'th') {
		const [widget, landing, status, register, collab] = await Promise.all([
			import('../lang/th/th_widget.json'),
			import('../lang/th/th_landing.json'),
			import('../lang/th/th_status.json'),
			import('../lang/th/th_register.json'),
			import('../lang/th/th_collab.json')
		]);
		msg = {
			...widget.default,
			...landing.default,
			...status.default,
			...register.default,
			...collab.default
		};
	} else if (lang === 'vi') {
		const [widget, landing, status, register, collab] = await Promise.all([
			import('../lang/vi/vi_widget.json'),
			import('../lang/vi/vi_landing.json'),
			import('../lang/vi/vi_status.json'),
			import('../lang/vi/vi_register.json'),
			import('../lang/vi/vi_collab.json')
		]);
		msg = {
			...widget.default,
			...landing.default,
			...status.default,
			...register.default,
			...collab.default
		};
	}

	// 3. 메시지 업데이트
	if (msg) {
		globalState.messages = msg;
	}
}

export async function initLanguage() {
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('selectedLanguage');
		const lang = saved || 'ko';
		await setLanguage(lang);
	} else {
		await setLanguage('ko');
	}
}
