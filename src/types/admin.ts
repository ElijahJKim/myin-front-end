// Admin 관련 타입 정의

export interface Influencer {
	id: string;
	name: string;
	sns_id: string;
	email: string;
	messenger_id: string | null;
	nationality: string;
	residence_country: string;
	primary_languages: string[];
	platforms: string[];
	follower_counts: Record<string, number>;
	agency_name: string | null;
	desired_fee: string | null;
	secondary_use_free: boolean;
	secondary_use_conditions: string | null;
	reference_links: string[] | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateInfluencerData {
	sns_id: string;
	email: string;
	messenger_id?: string | null;
	nationality: string;
	residence_country: string;
	primary_languages: string[];
	platforms: string[];
	follower_counts: Record<string, number>;
	agency_name?: string | null;
	desired_fee?: string | null;
	secondary_use_free: boolean;
	secondary_use_conditions?: string | null;
	reference_links?: string[] | null;
	notes?: string | null;
}

export interface Advertiser {
	id: string;
	// 추후 백엔드 API 스펙에 맞춰 추가
}

export interface Campaign {
	id: string;
	// 추후 백엔드 API 스펙에 맞춰 추가
}

export interface Collaboration {
	id: string;
	// 추후 백엔드 API 스펙에 맞춰 추가
}
