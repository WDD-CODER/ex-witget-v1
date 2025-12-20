import { httpService } from './http.service';

export const drugServiceRemote = {

    async queryDrugBank(query) {
    // 1. Create the stringified criteria
    const criteriaString = JSON.stringify({ q: query })

    try {
        // 2. Pass the object with the 'data' key. 
        // httpService.get will put this whole object into Axios 'params'
        const results = await httpService.get('/get-autocomplete', { data: criteriaString })
        console.log("🚀 ~ results:", results)

        if (!results || !results.length) return []
        
        return results.map(item => ({
            id: item._id || item.id,
            name: item.name || item.title || item.label,
            icon: '💊',
            metType: 'drug'
        }))
    } catch (error) {
        console.error("🚀 ~ Problem Reaching server", error)
        throw error
    }
},


    async fetchDepletions(items) {
        const body = { q: items };
        try {
            return await httpService.post('/depletions-data', body) || [];
        } catch (err) {
            console.error('❌ Depletions Fetch Failed:', err);
            throw err;
        }
    },

    async fetchOptimizations(items) {
        const body = { q: items };
        try {
            return await httpService.post('/optimization-data', body) || [];
        } catch (err) {
            console.error('❌ Optimizations Fetch Failed:', err);
            throw err;
        }
    }
};