import { env } from '$env/dynamic/public';

const getBaseURL = (): string => {
	return env.PUBLIC_API_BASE_URL || '';
};

const parseResponseSafely = async (response: Response): Promise<any> => {
	const contentType = response.headers.get('content-type') ?? '';

	if (contentType.includes('application/json')) {
		return response.json();
	}

	return response.text();
};

const requestJSON = async (url: string, init?: RequestInit): Promise<any> => {
	const response = await fetch(url, init);
	const body = await parseResponseSafely(response);

	if (!response.ok) {
		if (typeof body === 'string') {
			const compactText = body.replace(/\s+/g, ' ').trim();
			const preview = compactText.slice(0, 200) || 'empty response body';
			throw new Error(
				`Request failed (${response.status}) at ${response.url}. Non-JSON response: ${preview}`
			);
		}

		if (body && typeof body === 'object') {
			const serverMessage = body.message || body.detail || JSON.stringify(body);
			throw new Error(`Request failed (${response.status}) at ${response.url}. ${serverMessage}`);
		}

		throw new Error(`Request failed (${response.status}) at ${response.url}.`);
	}

	return body;
};

export const collaborationAPI = {
	async getInfluencersMatches(campaignId: string): Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/campaigns/${campaignId}/matches`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();

			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async getAdvertiserMatches(influencerId: string): Promise<any> {
		try {
			const response = await fetch(
				`${getBaseURL()}/collaboration/influencers/${influencerId}/matches`
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async writeGuideLineForm(campaignId: string, form: any): Promise<any> {
		try {
			const data = await requestJSON(`${getBaseURL()}/collaboration/campaigns/${campaignId}/guidelines`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async editGuideLineForm(campaignId: string, form: any): Promise<any> {
		try {
			const data = await requestJSON(`${getBaseURL()}/collaboration/campaigns/${campaignId}/guidelines`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async getGuideLineForm(campaignId: string): Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/campaigns/${campaignId}/guidelines`);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async getGuideLineFormByMatchId(matchId: string): Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/matches/${matchId}/guidelines`);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	

	async confirmGuideLineForm(matchId: string): Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/${matchId}/guidelines/confirm`, {
				method: 'POST'
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async objectionGuideLineForm(matchId: string, objectionReason: string): Promise<any> {
		try {
			const response = await fetch(
				`${getBaseURL()}/collaboration/${matchId}/guidelines/objections`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ objection_reason: objectionReason })
				}
			);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async writeShipmentInfoForm(matchId: string, form: any): Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/${matchId}/shipments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}

	},

	async getShipmentInfoForm(matchId: string): Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/${matchId}/shipments`);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async confirmShipment(matchId: string): Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/${matchId}/shipments/receive`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					matchId: matchId
				})
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},


	async getFeedbackForm(matchId: string, contentId: string): Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/${matchId}/content/${contentId}/transcription`);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async writeFeedbackForm(matchId: string, form: any, contentId: string): Promise<any> {
		try {
			const url = `${getBaseURL()}/collaboration/${matchId}/feedbacks`;
			
			// [수정 1] 인자로 받은 contentId를 body에 포함시킵니다.
			const requestBody = {
				...form, // 기존 폼 데이터 (feedbacks, file_key 등)
				content_upload_id: contentId // 명세서 요구사항: Body에 ID 추가
			};
	
			const response = await fetch(url, {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json',
					// 인증 토큰이 필요하다면 여기에 추가
					// 'Authorization': `Bearer ${token}` 
				},
				body: JSON.stringify(requestBody) // [수정] 합쳐진 데이터를 전송
			});
	
			// [수정 2] fetch는 404, 500 에러도 try로 빠지므로 수동으로 에러를 던져야 합니다.
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Request failed with status ${response.status}`);
			}
	
			const data = await response.json();
			return data;
		}
		catch (error) {
			console.error("API Error:", error);
			throw error;
		}
	},

	async confirmFeedback(contentId: string,matchId: string): Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/${matchId}/content/${contentId}/confirm`, {
				method: 'POST'
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async getfinalDraft(matchId: string, contentId: string): Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/${matchId}/content/${contentId}`);
			const data = await response.json();
			return data;
		}
		catch (error) {
			console.error(error);
			throw error;
		}
	},

	async getFeedback(matchId:string):Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/${matchId}/feedbacks`);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	async uploadFinalDraft(matchId:string, form:any):Promise<any> {
		try {
			const response = await fetch(`${getBaseURL()}/collaboration/${matchId}/content/final`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
};
