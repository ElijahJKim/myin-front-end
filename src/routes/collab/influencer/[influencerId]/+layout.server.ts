import { campaignsAPI } from '$lib/api/campaigns.ts';
import { collaborationAPI } from '$lib/api/collaboration.ts';

export const load = async ({ params }) => {


	let advertiserMatchesData = [];
    let campaignData = null;
    let guideLineFormDataFromCampaign = null;
    let campaignId = null;


    try {
        advertiserMatchesData = await collaborationAPI.getAdvertiserMatches(
            params.influencerId as string
        );
    } catch (e) {
        console.warn("광고주 매칭 정보 로드 실패:", e);
       
    }


    try {
        
        // advertiserMatchesData에서 캠페인 ID를 추출해 조회해야 합니다.
        const firstMatchCampaignId = advertiserMatchesData?.[0]?.campaign_id;
        if (firstMatchCampaignId) {
            campaignData = await campaignsAPI.getCampaign(firstMatchCampaignId);
        } else {
            campaignData = null;
        }
console.log("campaignData", campaignData);
        
    } catch (e) {
        console.warn("캠페인 정보 로드 실패:", e);
     
    }

    
    if (campaignData && campaignData.id) {
        campaignId = campaignData.id;

        try {
            guideLineFormDataFromCampaign = await collaborationAPI.getGuideLineForm(campaignId);
        } catch (e) {
            console.warn("가이드라인 폼 로드 실패 (또는 아직 없음):", e);
      
        }
    }

    return {
        advertiserMatchesData,
        campaignId, // 로드 실패 시 null일 수 있음
        campaignData, // 필요하다면 함께 리턴
        params: {
            influencerId: params.influencerId
        },
        guideLineFormDataFromCampaign
    };
};
