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
      console.log("🚀 ~ allDrugs:", allDrugs)

      const filtered = allDrugs.filter(item =>
        item.name.toLowerCase().includes(q) &&
        !selectedItems.find(s => s.name === item.name)
      ).slice(0, 5);

      return filtered;

    } catch (error) {
      console.log("🚀 ~ error:", error)
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
    if (!ItemNames || !ItemNames.length) return

    try {
      // 1. Immediate Action: Fetch Depletions (Fast)
      // We await this so the user sees the primary results quickly
      const depletions = await DrugService.fetchDepletions(ItemNames)

      // Update UI/Store with depletions immediately
      // (Replace 'store.commit' with your actual state management call)
      console.log('✅ Depletions loaded:', depletions)

      // 2. Background Action: Fetch Optimizations (Slow)
      // We do NOT 'await' this here if we want to return control to the UI, 
      // OR we call it immediately after and let it update the store later.
      this._loadOptimizations(ItemNames)

      console.log("🚀 ~ depletions:", depletions)
      return depletions

    } catch (error) {
      console.error('❌ Controller Error:', error)
      throw error // Re-throw so the UI can show an error toast/alert
    }
  },

async _loadOptimizations(ItemNames) {
  try {
    const optimizations = await DrugService.fetchOptimizations(ItemNames);
    console.log('✅ Optimizations loaded:', optimizations);
    
    return optimizations; // Added return statement
  } catch (error) {
    console.error('❌ Failed to load background optimizations:', error);
    return []; // Return empty array on error to prevent UI crashes
  }
}
};