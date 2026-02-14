import type { Pagination } from './const.ts';

export interface MatchItem {
	match_id: string;
	campaign_id: string;
	influencer_id: string;
	status: string;
	influencer_profile: {
		id: string;
		name: string;
		nationality: string;
		primary_languages: string[];
		platforms: string[];
		follower_counts: {
			additionalProp1: number;
			additionalProp2: number;
			additionalProp3: number;
		};
		secondary_use_free: boolean;
	};
	created_at: string;
	updated_at: string;
}

// 전체 응답 타입
export interface RecommendedInfluencersResponse {
	items: MatchItem[];
	pagination: Pagination;
}
