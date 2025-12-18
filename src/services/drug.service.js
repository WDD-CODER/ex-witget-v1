/**
 * Handles raw data communication.
 */
const DrugService = {
  /**
   * Simulates an asynchronous API call to fetch interaction results.
   */
  async fetchInteractions(token, items) {
    console.log('[DrugService] Fetching interactions for:', items);

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

export default DrugService;