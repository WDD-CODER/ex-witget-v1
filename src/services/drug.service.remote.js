import { httpService } from './http.service';

export const drugServiceRemote = {

    async queryDrugBank(query, selectedItems = []) {
        console.log("🚀 ~ selectedItems:", selectedItems)
        if (!query) return [];

        const criteriaString = JSON.stringify({ q: query });

        try {
            const results = await httpService.get('/get-autocomplete', { data: criteriaString })
            console.log("🚀 ~ results:", results[263])

            if (!results || !results.length) return [];

            const selectedNames = selectedItems.map(item => item.map(item.txt || '').toLowerCase());

            const newResults = results
                .filter(item => {
                    const itemName = (item.txt).toLowerCase();
                    // It seems that specific items have really long name, which looks like a broken. Info.
                    // Therefore I created this Condition did not show them.
                    // Example From database :
                    //Sodium ({(2S)-1,4-bis[2-(4-chloro-3- fluorophenoxy)acetamido]bicyclo[2.2.2]octan-2- yl}oxy)methyl
                    //hydrogen phosphate - 2-amino-2- (hydroxymethyl)propane-1,3-diol (1/1/1)
                    if (itemName.length > 30) return
                    return !selectedNames.includes(itemName);
                })
                .map(item => ({
                    id: item._id || item.id,
                    name: item.txt,
                    icon: (item.metType === 'drug') ? '💊' : '🍃',
                    metType: item.metType
                }));

            return newResults

        } catch (error) {
            console.log("🚀 ~ error:", error)
            throw Error(' Failed getting autocomplete')
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
            const optimizers = await httpService.post('/optimization-data', body) || [];
            const modifiedOptimizers = this._verifyOptimizationPayload(optimizers)
            return modifiedOptimizers
        } catch (err) {
            console.error('❌ Optimizations Fetch Failed:', err);
            throw err;
        }
    },

    _verifyOptimizationPayload(data) {
        const flatList = data.flatMap(group => group.vInteractions || []);

        // Deduplicate by slug or agent name
        const seen = new Set();
        return flatList.filter(item => {
            const duplicate = seen.has(item.slug);
            seen.add(item.slug);
            return !duplicate && item.side1Material?.name;
        }).map(interaction => ({
            interaction_id: interaction._id,
            name: interaction.side1Material?.name,
            causedBy: [
                interaction.side2Material?.name ||
                interaction.side2Label?.name ||
                interaction.side2Name
            ],
            clinical_advice: interaction.recommendation,
            alert_symptoms: interaction.monitor?.symptoms,
            evidence_grade: interaction.evidenceLevel,
            slug: interaction.slug,
            optyDosage: interaction.optyDosage
        }));
    },


};