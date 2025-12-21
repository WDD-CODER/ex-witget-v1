import { drugBank } from '../assets/data/drugBank';

// Rename the constant to drugServiceLocal to match the switcher import
export const drugServiceLocal = {
    async queryDrugBank(query, selectedItems = []) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query) return resolve([]);

        try {
          // Escape special regex characters to prevent crashes
          const sanitizedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`^${sanitizedQuery}`, 'i');
          const selectedNames = selectedItems.map(item => item.name.toLowerCase());

          const results = drugBank
            .filter(item => {
              const itemName = (item.name || item.title || item.label);
              return regex.test(itemName) && !selectedNames.includes(itemName.toLowerCase());
            })
            .map(item => ({
              id: item._id || item.id,
              name: item.name || item.title || item.label,
              icon: '💊',
              type: 'drug'
            }));

          resolve(results);
        } catch (e) {
          console.error("Regex Error:", e);
          resolve([]); // Return empty to prevent crash
        }
      }, 50);
    });
  },

    async fetchDepletions(itemNames) {
        // Logic: Matches how your Controller calls the service
        if (!itemNames || !itemNames.length) return [];

        await new Promise(resolve => setTimeout(resolve, 800));

        // Data: Exactly as your Backend console log shows
        return [
            {
                _id: '602a916a71d8c92df8be4748',
                side2DraftName: null,
                name: 'Vitamin D',
                sure: true,
                labelId: '61c1163dbca1ec37f2e4a11c',
                labelName: 'Vitamin D & SSRIs',
                monitor: {
                    labTests: ['25-hydroxy Vitamin D test'],
                    symptoms: ['Bone pain', 'Mood changes'],
                    general: [],
                    otherTests: []
                },
                type: 'vitamin',
                causedBy: ['Citalopram', 'Atorvastatin',]
            },
            {
                _id: '602a916a71d8c92df8be43a1',
                side2DraftName: null,
                name: 'Coenzyme Q10',
                sure: true,
                labelId: '6140481454623a077d580bdb',
                labelName: 'Coenzyme Q10 & Statins',
                monitor: {
                    labTests: ['Blood CoQ10 Levels'],
                    symptoms: ['Muscle pain', 'Fatigue'],
                    general: [],
                    otherTests: []
                },
                type: 'vitamin',
                causedBy: ['Atorvastatin']
            },
            // {
            //     _id: '602a916s71d8c92df8be43a1',
            //     side2DraftName: null,
            //     name: 'fuyyaca Q10',
            //     sure: true,
            //     labelId: '6140441454623a077d580bdb',
            //     labelName: 'Coenzyme Q10 & Statins',
            //     monitor: {
            //         labTests: ['Blood CoQ10 Levels'],
            //         symptoms: ['Muscle pain', 'Fatigue'],
            //         general: [],
            //         otherTests: []
            //     },
            //     type: 'vitamin',
            //     causedBy: ['Atorvastatin']
            // }
        ];
    },

    async fetchOptimizations(itemNames) {
        if (!itemNames || !itemNames.length) return [];

        await new Promise(resolve => setTimeout(resolve, 1500));

        return [
            {
                interaction_id: 'opt_101',
                name: 'Timing Optimization',
                causedBy: ['Atorvastatin'],
                clinical_advice: 'Take with a fat-containing meal to maximize absorption.',
                alert_symptoms: [],
                evidence_grade: 'A',
                slug: 'timing-atorvastatin',
                optyDosage: null
            },
            {
                interaction_id: 'opt_102',
                name: 'Magnesium Synergy',
                causedBy: ['Melatonin & Statins'],
                clinical_advice: 'Take 2 hours apart to avoid minor absorption interference.',
                alert_symptoms: [],
                evidence_grade: 'B',
                slug: 'mag-cit-synergy',
                optyDosage: '200mg'
            },
            // {
            //     interaction_id: 'opt_102',
            //     name: 'loos of will',
            //     causedBy: ['Melatonin & Statins'],
            //     clinical_advice: 'Take 2 hours apart to avoid minor absorption interference.',
            //     alert_symptoms: [],
            //     evidence_grade: 'B',
            //     slug: 'mag-cit-synergy',
            //     optyDosage: '200mg'
            // }
        ];
    }
};