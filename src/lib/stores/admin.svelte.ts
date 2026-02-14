import { campaignsAPI } from '$lib/api/campaigns.ts';
import { influencersAPI } from '$lib/api/influencers.ts';
import { matchingAPI } from '$lib/api/matching.ts';
import type { GetCampaignData } from '../../types/campaign.ts';
import type { Influencer } from '../../types/admin.ts';

// 캠페인 상태
export const campaignsState = $state({
	data: [] as GetCampaignData[],
	isLoading: false,
	error: null as string | null,
	lastFetched: null as number | null
});

// 인플루언서 상태
export const influencersState = $state({
	data: [] as Influencer[],
	isLoading: false,
	error: null as string | null,
	lastFetched: null as number | null
});

// 매칭 상태 (캠페인별 매칭 데이터 캐시)
export const matchingState = $state({
	matchesMap: {} as Record<string, any[]>,
	isLoading: false,
	error: null as string | null,
	lastFetched: null as number | null
});

// 캐시 유효 시간 (5분)
const CACHE_DURATION = 5 * 60 * 1000;

function isCacheValid(lastFetched: number | null): boolean {
	if (!lastFetched) return false;
	return Date.now() - lastFetched < CACHE_DURATION;
}

// 캠페인 로드 (캐시가 유효하면 API 호출 안 함)
export async function loadCampaigns(forceRefresh = false) {
	if (!forceRefresh && isCacheValid(campaignsState.lastFetched) && campaignsState.data.length > 0) {
		return campaignsState.data;
	}

	try {
		campaignsState.isLoading = true;
		campaignsState.error = null;

		const response: any = await campaignsAPI.getAllCampaigns();

		let newCampaigns: GetCampaignData[] = [];
		if (response && Array.isArray(response.campaigns)) {
			newCampaigns = response.campaigns;
		} else if (response && Array.isArray(response.items)) {
			newCampaigns = response.items;
		} else if (Array.isArray(response)) {
			newCampaigns = response;
		}

		campaignsState.data = newCampaigns;
		campaignsState.lastFetched = Date.now();

		return newCampaigns;
	} catch (e) {
		campaignsState.error = e instanceof Error ? e.message : '캠페인 로드 실패';
		throw e;
	} finally {
		campaignsState.isLoading = false;
	}
}

// 인플루언서 로드 (캐시가 유효하면 API 호출 안 함)
export async function loadInfluencers(forceRefresh = false) {
	if (
		!forceRefresh &&
		isCacheValid(influencersState.lastFetched) &&
		influencersState.data.length > 0
	) {
		return influencersState.data;
	}

	try {
		influencersState.isLoading = true;
		influencersState.error = null;

		const data = await influencersAPI.getAllInfluencers();
		influencersState.data = data;
		influencersState.lastFetched = Date.now();

		return data;
	} catch (e) {
		influencersState.error = e instanceof Error ? e.message : '인플루언서 로드 실패';
		throw e;
	} finally {
		influencersState.isLoading = false;
	}
}

// 모든 캠페인의 매칭 정보 로드
export async function loadAllMatches(forceRefresh = false) {
	// 캠페인 데이터가 없으면 먼저 로드
	if (campaignsState.data.length === 0) {
		await loadCampaigns();
	}

	if (
		!forceRefresh &&
		isCacheValid(matchingState.lastFetched) &&
		Object.keys(matchingState.matchesMap).length > 0
	) {
		return matchingState.matchesMap;
	}

	try {
		matchingState.isLoading = true;
		matchingState.error = null;

		const matchPromises = campaignsState.data.map(async (campaign) => {
			try {
				const data = await matchingAPI.getInfluencersByCampaign(campaign.id);
				return { campaignId: campaign.id, items: data.items };
			} catch (e) {
				console.error(`캠페인 ${campaign.id} 매칭 로드 실패:`, e);
				return { campaignId: campaign.id, items: [] };
			}
		});

		const results = await Promise.all(matchPromises);
		const newMatchesMap: Record<string, any[]> = {};
		results.forEach(({ campaignId, items }) => {
			newMatchesMap[campaignId] = items;
		});

		matchingState.matchesMap = newMatchesMap;
		matchingState.lastFetched = Date.now();

		return newMatchesMap;
	} catch (e) {
		matchingState.error = e instanceof Error ? e.message : '매칭 로드 실패';
		throw e;
	} finally {
		matchingState.isLoading = false;
	}
}

// 특정 캠페인의 매칭 정보만 갱신
export async function refreshCampaignMatches(campaignId: string) {
	try {
		const data = await matchingAPI.getInfluencersByCampaign(campaignId);
		matchingState.matchesMap[campaignId] = data.items;
		return data.items;
	} catch (e) {
		console.error(`캠페인 ${campaignId} 매칭 갱신 실패:`, e);
		throw e;
	}
}

// 캠페인 추가/수정/삭제 후 캐시 무효화
export function invalidateCampaignsCache() {
	campaignsState.lastFetched = null;
}

// 인플루언서 추가/수정/삭제 후 캐시 무효화
export function invalidateInfluencersCache() {
	influencersState.lastFetched = null;
}

// 매칭 추가/수정/삭제 후 캐시 무효화
export function invalidateMatchingCache() {
	matchingState.lastFetched = null;
}

// 전체 캐시 무효화
export function invalidateAllCache() {
	campaignsState.lastFetched = null;
	influencersState.lastFetched = null;
	matchingState.lastFetched = null;
}
