import { isLoading } from '../../../../../stores/loading.js';

export const load = async ({ parent }) => {
    isLoading.set(true);
    try {
        const data = await parent();
        return data;
    } finally {
        isLoading.set(false);
    }
};

