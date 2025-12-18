// src/services/ApiService.js - Refactored for Token Authentication

// const MOCK_DATA = {
//     patientId: 'P12345-AFK',
//     patientName: 'John A. Doe',
//     fileStatus: 'Review Required',
//     lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
//     criticalAlerts: 3,
//     recentActivity: [
//         { id: 1, type: 'Update', description: 'Vitals uploaded', date: '2 hours ago' },
//         { id: 2, type: 'Alert', description: 'High blood pressure reading', date: '1 day ago' }
//     ]
// };

/**
 * Simulates an asynchronous API call, requiring a token.
 * @param {string} authToken - The user's authentication token (JWT).
 * @returns {Promise<Object>} A promise that resolves with data or rejects with an error.
 * * @param {Array} items - List of drugs/supplements to check.
 */
const ApiService = {
  async fetchMedicalFileData(token, items) {
    console.log('[ApiService] Fetching for:', items);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // MOCK LOGIC: 
    // If you add "nothing", it returns an empty list.
    // Otherwise, it returns one danger and one safe card.
    
    if (items.includes('nothing')) {
      return {
        success: true,
        data: []
      };
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

export default ApiService;

