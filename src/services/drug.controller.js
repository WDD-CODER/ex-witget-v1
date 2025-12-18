import { DrugService } from '../services/drug.service';

export const DrugController = {
  /**
   * Business Logic: Get filtered suggestions based on user input
   */
  async getSuggestions(query, selectedItems) {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];

    // Controller asks Service for the raw data
    const allDrugs = await DrugService.queryDrugBank();

    return allDrugs.filter(item => 
      item.name.toLowerCase().includes(q) && 
      !selectedItems.find(s => s.name === item.name)
    ).slice(0, 5);
  },

  /**
   * Business Logic: Create a consistent object for manual entries
   */
  createManualEntry(query) {
    return {
      name: query.trim(),
      type: 'manual',
      icon: '💊'
    };
  }
};