import { env } from '$env/dynamic/public';
import { fail, redirect } from '@sveltejs/kit';

const COUNTRY_MAP: Record<string, string> = {
	태국: 'thailand',
	베트남: 'vietnam',
	싱가포르: 'singapore'
};

const PLATFORM_MAP: Record<string, string> = {
	틱톡: 'tiktok',
	인스타그램: 'instagram',
	유튜브: 'youtube'
};

export const actions = {
	createCampaign: async ({ request }) => {
		const formData = await request.formData();

		let createdCampaignId: string | null = null;

		const rawPlatforms = formData.getAll('platforms') as string[];
		const platforms = rawPlatforms.map((p) => PLATFORM_MAP[p] || p.toLowerCase());

		const rawCountries = formData.getAll('target_countries') as string[];
		const target_countries = rawCountries.map((c) => COUNTRY_MAP[c] || c);

		const payload = {
			brand_name: formData.get('brand_name') as string,
			product_name: formData.get('product_name') as string,
			campaign_purpose: formData.get('campaign_purpose') as string,

			target_countries: target_countries,
			platforms: platforms,

			budget_range: `${formData.get('budget_min')}-${formData.get('budget_max')}`,
			upload_deadline: formData.get('upload_period') as string,
			product_link: formData.get('product_link') as string,
			memo: formData.get('etc') as string,
			email: formData.get('charge_email') as string,

			manager_name: formData.get('charge_name') as string,
			manager_phone: formData.get('charge_phone') as string
		};

		console.log('서버에서 받은 payload:', payload);

		if (!payload.brand_name || payload.target_countries.length === 0 || !payload.email) {
			return fail(400, { missing: true, message: '필수 값을 입력해주세요.' });
		}

		const apiUrl = `${env.PUBLIC_API_BASE_URL}/campaigns`;
        console.log('🚀 [Debug] 요청 보낼 주소:', apiUrl); // 주소가 제대로 나오는지 확인
        console.log('🚀 [Debug] 보낼 데이터:', JSON.stringify(payload));

		try {
			const response = await fetch(`${env.PUBLIC_API_BASE_URL}/campaigns/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
			console.log('🚀 [Debug] 응답 상태 코드:', response.status);

			if (!response.ok) {
                // 1. 에러 내용을 텍스트로 받음
                const errorText = await response.text(); 
                
                // 2. fail 함수에 'backend_error' 라는 이름으로 담아서 보냄
                return fail(response.status, { 
                    message: '캠페인 등록 실패', 
                    backend_error: errorText // 👈 여기가 핵심
                });
            }

			const result = await response.json();

			if (result.id) {
				createdCampaignId = result.id;
			}
		} catch (error) {
			console.error(error);
			return fail(500, { 
                message: '서버 연결 오류', 
                backend_error: JSON.stringify(error) // 👈 에러 객체를 문자열로 변환
            });
		}

		if (createdCampaignId) {
			throw redirect(303, `/campaign/${createdCampaignId}`);
		} else {
			throw redirect(303, '/');
		}
	}
};
