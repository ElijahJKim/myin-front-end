export interface CreateCampaignData {
	brand_name: string;
	product_name: string;
	campaign_purpose: string;
	target_countries: string[];
	platforms: string[];
	budget_range: string;
	upload_deadline: string;
	product_link: string;
	memo: string;
	email: string;
	manager_name: string;
	manager_phone: string;
}

export interface GetCampaignData {
	id: string;
	has_guideline: boolean;
	brand_name: string;
	product_name: string;
	campaign_purpose: string;
	target_countries: string[];
	platforms: string[];
	budget_range: string;
	upload_deadline: string;
	product_link: string;
	memo: string;
	email: string;
	manager_name: string;
	manager_phone: string;
	status: string;
	created_at: string;
	token_url: string;
}
