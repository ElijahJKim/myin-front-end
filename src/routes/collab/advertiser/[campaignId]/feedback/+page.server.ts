import { collaborationAPI } from '$lib/api/collaboration.ts';

export const load = async({url, params}) =>{
    
    const matchId = url.searchParams.get('matchId');
    const contentId = url.searchParams.get('contentId');
    const campaignId = params.campaignId;

    console.log('📍 Feedback Load:', { matchId, contentId, campaignId });

    // 데이터 확인
    if (!matchId || !contentId) {
        console.error('❌ Missing parameters:', { matchId, contentId });
        return {
            matchId,
            contentId,
            feedbackFormData: null,
            campaignId
        };
    }

    try {
        const feedbackFormData = await collaborationAPI.getFeedbackForm(matchId, contentId);
        return {
            matchId,
            contentId,
            feedbackFormData,
            campaignId
        };
    } catch (error) {
        console.error('❌ Error loading feedback form:', error);
        return {
            matchId,
            contentId,
            feedbackFormData: null,
            campaignId
        };
    }
}
