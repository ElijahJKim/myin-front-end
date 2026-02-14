// src/routes/(admin)/admin/+page.ts
import { redirect } from '@sveltejs/kit';

export const load = () => {
	// /admin 으로 들어오면 강제로 /admin/influencers 로 보내버림
	throw redirect(302, '/admin/campaigns');
};
