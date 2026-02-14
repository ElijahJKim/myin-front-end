import { collaborationAPI } from '$lib/api/collaboration.ts';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types.js';


export const load = async ({ url }) => {
	const matchId = url.searchParams.get('matchId');

    if(matchId){
        try{
            const shipmentInfo = await collaborationAPI.getShipmentInfoForm(matchId);
            return {
                shipmentInfo: shipmentInfo
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

	return {
		matchId
	};
};


export const actions = {
    confirm: async ({ request }) => {
        const formData = await request.formData();
        const matchId = formData.get('matchId');

        if (!matchId) {
            return fail(400, { missing: true, message: 'Match ID is required' });
        }

        try {
     
            await collaborationAPI.confirmShipment(matchId.toString());

            return { success: true };
            
        } catch (error: any) {
            console.error(error);
            // API 에러 응답에 따라 상태 코드 분기 가능
            return fail(500, { error: true, message: error.message || 'Server error' });
        }
    }
} satisfies Actions;