import { influencersAPI } from '$lib/api/influencers.ts';

export const load = async ({ params }) => {
	const influencerId = params.influencerId;

	const influencer = await influencersAPI.getById(influencerId);

	return {
		influencer
	};
};