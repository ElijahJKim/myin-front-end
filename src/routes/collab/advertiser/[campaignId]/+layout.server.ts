import { campaignsAPI } from '$lib/api/campaigns.ts';
import { collaborationAPI } from '$lib/api/collaboration.ts';

export const load = async ({ params }) => {

    const timed = async <T>(label: string, fn: () => Promise<T>) => {
        const s = Date.now();
        try {
          const result = await fn();
          console.log(`[LOAD OK] ${label}: ${Date.now() - s}ms`);
          return result;
        } catch (e) {
          console.log(`[LOAD ERR] ${label}: ${Date.now() - s}ms`);
          throw e;
        }
      };
    
	try {
    
        const campaignData = await timed("campaignData", () => campaignsAPI.getCampaign(params.campaignId));

        
        let influencersMatchesData = [];
        let advertiserMatchesData = [];
        let guideLineFormData = null;

        try {
            influencersMatchesData = await timed("influencersMatchesData", () => collaborationAPI.getInfluencersMatches(params.campaignId));
        } catch (e) {
            console.warn("매칭 정보가 없거나 로드 실패 (404 예상):", e);
          
            influencersMatchesData = [];
        }

       
        if (influencersMatchesData && influencersMatchesData.length > 0) {
            const firstMatch = influencersMatchesData[0];
            
          
            if (firstMatch?.influencer_id) {
                try {
                    advertiserMatchesData = await timed("advertiserMatchesData", () => collaborationAPI.getAdvertiserMatches(firstMatch.influencer_id));
                } catch (e) {
                    console.warn("광고주 매칭 상세 로드 실패:", e);
                }
            }
        }

        
        try {
            
            guideLineFormData = await timed("guideLineFormData", () => collaborationAPI.getGuideLineForm(params.campaignId));
        } catch (e) {
            console.warn("가이드라인 폼이 아직 없음:", e);
            guideLineFormData = null;
        }

        return {
            influencersMatchesData,
            advertiserMatchesData,
            campaignData,
            params: {
                campaignId: params.campaignId
            },
            guideLineFormData
        };

    } catch (error) {
        // 캠페인 정보조차 못 불러오면 정말 에러임
        console.error("Layout Load Error:", error);
        throw error; 
    }
};
