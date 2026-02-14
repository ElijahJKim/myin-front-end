export const load = async ({ url }) => {
	const type = url.searchParams.get('type');
	return {
		type
	};
};

