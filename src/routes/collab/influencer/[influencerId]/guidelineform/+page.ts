import { collaborationAPI } from '$lib/api/collaboration.ts';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ url, params }) => {
	const matchId = url.searchParams.get('matchId');

	const guidelineFormData = await collaborationAPI.getGuideLineFormByMatchId(matchId as string);

	return {
		matchId,
		params,
		guidelineFormData
	};
};
