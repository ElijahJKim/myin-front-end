import { collaborationAPI } from '$lib/api/collaboration.ts';

export const load = async ({ url }) => {
    const matchId = url.searchParams.get('matchId');
    const contentId = url.searchParams.get('contentId');

    const finalDraft = await collaborationAPI.getfinalDraft(matchId as string, contentId as string);

    return {
        matchId,
        contentId,
        finalDraft
    };
};