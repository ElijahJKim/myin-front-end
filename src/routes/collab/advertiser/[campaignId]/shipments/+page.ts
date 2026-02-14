export const load = async ({ url }) => {
	const matchId = url.searchParams.get('matchId');
	return {
		matchId
	};
};

