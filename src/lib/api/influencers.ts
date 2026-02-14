// Admin API 함수
import { env } from '$env/dynamic/public';
import type { CreateInfluencerData, Influencer } from '../../types/admin.ts';

const getBaseURL = () => {
	return env.PUBLIC_API_BASE_URL || '';
};

// Influencers API
export const influencersAPI = {
	/**
	 * 전체 인플루언서 목록 조회
	 */
	async getAllInfluencers(): Promise<Influencer[]> {
		try {
			const response = await fetch(`${getBaseURL()}/admin/influencers`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			return Array.isArray(data.items) ? data.items : data.items || [];
		} catch (error) {
			console.error('Failed to fetch influencers:', error);
			throw error;
		}
	},

	/**
	 * 특정 인플루언서 조회
	 * @param id - 인플루언서 ID
	 */
	async getById(id: string): Promise<Influencer> {
		try {
			const response = await fetch(`${getBaseURL()}/admin/influencers/${id}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error(`Failed to fetch influencer ${id}:`, error);
			throw error;
		}
	},

	/**
	 * 새 인플루언서 생성
	 * @param data - 인플루언서 데이터
	 */
	async create(data: CreateInfluencerData): Promise<Influencer> {
		try {
			const response = await fetch(`${getBaseURL()}/admin/influencers`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Failed to create influencer:', error);
			throw error;
		}
	},

	/**
	 * 인플루언서 정보 수정
	 * @param id - 인플루언서 ID
	 * @param data - 수정할 데이터
	 */
	async update(id: string, data: Partial<CreateInfluencerData>): Promise<Influencer> {
		try {
			const response = await fetch(`${getBaseURL()}/admin/influencers/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error(`Failed to update influencer ${id}:`, error);
			throw error;
		}
	},

	/**
	 * 인플루언서 삭제
	 * @param id - 인플루언서 ID
	 */
	async delete(id: string): Promise<void> {
		try {
			const response = await fetch(`${getBaseURL()}/admin/influencers/${id}`, {
				method: 'DELETE'
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
		} catch (error) {
			console.error(`Failed to delete influencer ${id}:`, error);
			throw error;
		}
	}
};
