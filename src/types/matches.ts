import type { Influencer } from './admin.ts';
import type { GetCampaignData } from './campaign.ts';

export interface InfluencersMatchData {
	match_id: string;
	influencer_id: string;
	influencer_name: string;
	influencer_progress: string;
	influencer_todo: string;
	influencer_todo_enabled: boolean;
	advertiser_todo: string;
	advertiser_todo_enabled: boolean;
	advertiser_progress:string;
	draft_content_id: string;
	final_content_id: string;
}

export interface AdvertiserMatchData {
	match_id: string;
	campaign_id: string;
	brand_name: string;
	upload_deadline: string;
	advertiser_progress: string;
	advertiser_todo: string;
	advertiser_todo_enabled: boolean;
	influencer_progress:string;
	influencer_todo: string;
	influencer_todo_enabled: boolean;
	draft_content_id: string;
	final_content_id: string;
}

export interface GuideLineFormData {
	brand_name: string;
	product_name: string;
	campaign_period: string;
	platforms: string[];
	campaign_purpose: string;
	tone_mood: string[];
	video_length: string;
	subtitle_required: string[];
	required_mentions: string;
	required_shots: string[];
	required_shots_other: string;
	prohibited_items: string;
	hashtags: string;
	required_brand_tag: string[];
	precautions: string;
	other: string;
	production_fee: string;
}
