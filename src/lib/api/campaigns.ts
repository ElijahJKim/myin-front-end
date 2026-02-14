import { env } from '$env/dynamic/public';
import type { GetCampaignData } from '../../types/campaign.ts';

const getBaseURL = (): string => {
	return env.PUBLIC_API_BASE_URL || '';
};

export const campaignsAPI = {
	async getAllCampaigns(): Promise<GetCampaignData[]> {
		try {
			const response = await fetch(`${getBaseURL()}/admin/campaigns`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();

			return data.items;
		} catch (error) {
			console.error(`Failed to fetch all campaigns:`, error);
			throw error;
		}
	},

	async getCampaign(id: string): Promise<GetCampaignData> {
		try {
			const response = await fetch(`${getBaseURL()}/campaigns/${id}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error(`Failed to fetch campaign ${id}:`, error);
			throw error;
		}
	},

	/**
	 * 캠페인 승인 (POST)
	 * @param id 캠페인 ID
	 * @param baseUrl 프론트엔드 도메인 주소 (예: https://ejkstudio.com)
	 */

	async getCampaignApprove(id: string, baseUrl: string): Promise<boolean> {
		try {
			const response = await fetch(`${getBaseURL()}/admin/campaigns/${id}/approve`, {
				method: 'POST', // 보통 상태 변경은 POST나 PUT을 사용합니다.
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					base_url: baseUrl
				})
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error(`Failed to fetch campaign approve ${id}:`, error);
			throw error;
		}
	},

	async deleteCampaign(id: string): Promise<boolean> {
		try {
			const response = await fetch(`${getBaseURL()}/admin/campaigns/${id}`, {
				method: 'DELETE'
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error(`Failed to delete campaign ${id}:`, error);
			throw error;
		}
	}
};
