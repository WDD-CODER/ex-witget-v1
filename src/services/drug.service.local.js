import { drugBank } from '../assets/data/drugBank';

// Rename the constant to drugServiceLocal to match the switcher import
export const drugServiceLocal = {
    async queryDrugBank() {
        return new Promise((resolve) => {
            setTimeout(() => resolve(drugBank), 50);
        });
    },

    async fetchInteractions(token, items) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (items.includes('nothing')) {
            return { success: true, data: [] };
        }

        return {
            success: true,
            data: [
                { 
                    title: "High Risk Interaction", 
                    description: "Combining these substances may cause severe respiratory depression.", 
                    severity: "high" 
                },
                { 
                    title: "Information", 
                    description: "No known adverse interactions found with Vitamin C.", 
                    severity: "low" 
                }
            ]
        };
    }
};