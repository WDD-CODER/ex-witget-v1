<template>
  <div class="results-screen">
    <div class="card-header">
      <h3>Analysis Results</h3>
      <button class="back-btn" @click="$emit('set-screen', 'SearchScreen')">Back</button>
    </div>

    <div class="card-body">
      <div v-if="!results || results.length === 0" class="loading-state">
        No interactions detected for these items.
      </div>

      <div v-else class="results-container">
        <div 
          v-for="(res, idx) in results" 
          :key="idx"
          :class="['result-card', res.severity === 'high' ? 'danger' : 'safe']"
        >
          <span class="result-title">{{ res.title }}</span>
          <p>{{ res.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['results']
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  h3 { margin: 0; font-size: 16px; color: #1b3a57; }
  .back-btn { background: none; border: none; color: #1b3a57; text-decoration: underline; cursor: pointer; }
}

.card-body {
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;

  .results-container {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .result-card {
      padding: 10px;
      border-radius: 8px;
      font-size: 13px;
      border-left: 4px solid #ddd;
      
      &.danger { background: #fff5f5; border-left-color: #d32f2f; color: #b71c1c; }
      &.safe { background: #f1f8e9; border-left-color: #388e3c; color: #1b5e20; }
      .result-title { display: block; font-weight: bold; margin-bottom: 2px; }
    }
  }
  .loading-state { text-align: center; padding: 20px; color: #666; font-style: italic; }
}
</style>