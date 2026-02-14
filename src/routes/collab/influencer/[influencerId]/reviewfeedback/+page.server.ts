import { collaborationAPI } from '$lib/api/collaboration.ts';


export const load = async ({url,params})=>{
    const matchId = url.searchParams.get('matchId');
    const contentId = url.searchParams.get('contentId');
    const influencerId = params.influencerId;

    const feedback = await collaborationAPI.getFeedback(matchId as string);
    const draftContent = await collaborationAPI.getFeedbackForm(matchId as string, contentId as string);

    return {
        matchId,
        feedback,
        draftContent,
   
        influencerId
    };
}