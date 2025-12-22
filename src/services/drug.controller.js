import DrugService from './drug.service';

export const DrugController = {

  async getSuggestions(query, selectedItems) {

    try {
      if (!query || typeof query !== 'string') return [];
      const q = query.toLowerCase().trim();

      if (q.length < 2) {
        return [];
      }

      const allDrugs = await DrugService.queryDrugBank(query);

      const filtered = allDrugs.filter(item =>
        item.name.toLowerCase().includes(q) &&
        !selectedItems.find(s => s.name === item.name)
      ).slice(0, 5);

      return filtered;

    } catch (error) {
      console.error("🚀 ~ error:", error)
      throw error
    }
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
  },

  async getAnalysis(ItemNames) {
    if (!ItemNames || !ItemNames.length) return;
    try {
      const depletions = await DrugService.fetchDepletions(ItemNames);
      return depletions;
    } catch (error) {
      if (error.name === 'AbortError') return;
      throw error;
    }
  },

  async loadOptimizations(ItemNames) {
    try {
      const optimizations = await DrugService.fetchOptimizations(ItemNames);
      return optimizations
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
};