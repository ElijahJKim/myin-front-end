import { env } from '$env/dynamic/public';
import { campaignsAPI } from '$lib/api/campaigns.ts';
import { matchingAPI } from '$lib/api/matching.ts';

export const load = async ({ params }) => {
	const campaign = await campaignsAPI.getCampaign(params.id);

	let recommendedInfluencers = null;

	if (campaign.status === 'approved') {
		try {
			recommendedInfluencers = await matchingAPI.getRecommendedInfluencers(params.id);
			console.log(recommendedInfluencers);
		} catch (error) {
			console.error('추천 인플루언서 로딩 실패:', error);
			recommendedInfluencers = { items: [], pagination: {} };
		}
	}

	// 3. 데이터 반환
	return {
		campaign,
		recommendedInfluencers
	};
};
// import { env } from '$env/dynamic/public';
// import { campaignsAPI } from '$lib/api/campaigns.ts';

// export const load = async ({ params }) => {
// 	const response = await campaignsAPI.getCampaign(params.id);
// 	console.log('response', response);
// 	return response;
// };
