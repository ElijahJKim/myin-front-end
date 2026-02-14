// Admin API 함수
import { env } from '$env/dynamic/public';
import type { RecommendedInfluencersResponse } from '../../types/matched.ts';

const getBaseURl = (): string => {
	return env.PUBLIC_API_BASE_URL || '';
};

export const matchingAPI = {
	async getInfluencersByCampaign(campaignId: string | number): Promise<any> {
		try {
			const response = await fetch(`${getBaseURl()}/matches/campaigns/${campaignId}/influencers`);
			if (!response.ok) {
				// 매칭이 없는 경우 404가 올 수도 있으므로 빈 배열 처리 등을 고려
				if (response.status === 404) return [];
				throw new Error('Failed to fetch matched influencers');
			}
			return await response.json();
		} catch (error) {
			console.error(error);
			return [];
		}
	},

	async createMatching(campaign_id: string, influencer_ids: string[]): Promise<any> {
		try {
			const response = await fetch(
				`${getBaseURl()}/admin/campaigns/${campaign_id}/recommend-influencers`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						campaign_id: campaign_id,
						influencer_ids: influencer_ids
					})
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const responseText = await response.text();
			console.log('서버 원본 응답(텍스트):', responseText);

			// 내용이 없으면 빈 객체 반환, 있으면 JSON 파싱
			const data = responseText ? JSON.parse(responseText) : {};

			console.log('파싱된 데이터:', data);
			return data;
		} catch (error) {
			console.error(`Failed to fetch campaign approve`, error);
			throw error;
		}
	},

	async getRecommendedInfluencers(campaign_id: string): Promise<RecommendedInfluencersResponse> {
		try {
			const reponse = await fetch(`${getBaseURl()}/matches/campaigns/${campaign_id}/influencers`);
			if (!reponse.ok) {
				throw new Error(`HTTP error! status: ${reponse.status}`);
			}
			const data = await reponse.json();
			console.log('추천 인플루언서 데이터:', data);

			return data;
		} catch (error) {
			console.error(`Failed to fetch recommended influencers`, error);
			throw error;
		}
	},

	// [수정] 배치 처리를 위한 매칭 완료 함수
	async completeMatchingBatch(
		campaignId: string,
		influencerIds: string[] | number[],
		baseUrl: string
	): Promise<void> {
		try {
			// 1. matches 배열 생성
			const matchesPayload = influencerIds.map((id) => ({
				campaign_id: campaignId,
				influencer_id: String(id)
			}));

			// 2. 배치 API 호출
			// 스웨거 Endpoint: /matches/complete
			const response = await fetch(`${getBaseURl()}/matches/complete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					matches: matchesPayload, // matches 배열
					base_url: baseUrl // base_url 필드 추가
				})
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => ({}));
				throw new Error(errData.message || '매칭 완료(협업 룸 생성) 처리에 실패했습니다.');
			}
		} catch (error) {
			console.error('매칭 완료 배치 처리 중 오류:', error);
			throw error;
		}
	},

	// [수정] 최종적으로 호출되는 다중 선택 함수
	async selectMultipleInfluencers(
		campaignId: string,
		influencerIds: string[] | number[]
	): Promise<void> {
		try {
			// 단계 1: 배치로 'Select' 액션 수행 (이전 답변 코드 참조)
			await this.performActionBatch(campaignId, influencerIds, 'select');

			// 단계 2: 배치로 'Complete' 액션 수행 (협업 룸 생성)
			// base_url은 현재 페이지의 origin 등을 사용
			const currentBaseUrl = window.location.origin;
			await this.completeMatchingBatch(campaignId, influencerIds, currentBaseUrl);
		} catch (error) {
			console.error('일괄 선택 및 완료 처리 중 오류:', error);
			throw error;
		}
	},

	// (참고) 이전 답변의 performActionBatch가 없으시다면 아래처럼 만드시면 됩니다.
	async performActionBatch(
		campaignId: string,
		influencerIds: string[] | number[],
		action: 'select' | 'reject'
	) {
		const matchesPayload = influencerIds.map((id) => ({
			campaign_id: campaignId,
			influencer_id: String(id),
			action: action,
			notes: ''
		}));

		const response = await fetch(`${getBaseURl()}/matches/actions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ matches: matchesPayload })
		});

		if (!response.ok) throw new Error('Action failed');
	},

	async rematch(campaignId: string): Promise<any> {
		const response = await fetch(
			`${getBaseURl()}/matches/campaigns/${campaignId}/recommendations/reject-all`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			}
		);
		const data = await response.json();
		if (!response.ok) throw new Error(`Failed to rematch ${campaignId}`);
		return data;
	},

	async cancelMatching(campaignId: string): Promise<any> {
		const response = await fetch(
			`${getBaseURl()}/matches/campaigns/${campaignId}/recommendations/reject-all`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					campaign_id: campaignId
				})
			}
		);
		const data = await response.json();
		if (!response.ok) throw new Error(`Failed to cancel matching ${campaignId}`);
		return data;
	}
};
