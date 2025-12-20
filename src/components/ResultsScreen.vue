<template>
  <div class="results-screen">
    <div class="card-header">
      <h3>Analysis Results</h3>
      <button class="back-btn" @click="$emit('set-screen', 'SearchScreen')">Back</button>
    </div>

    <div class="card-body">
      <section class="analysis-section">
        <h4>Depletions</h4>
        <div v-if="isLoadingDepletions" class="loading-state">Finding depletions...</div>
        <div v-else-if="!depletions.length" class="empty-state">No depletions detected.</div>
        <div v-else class="results-container">
          <div v-for="(res, idx) in depletions" :key="'dep-'+idx" class="result-card safe">
            <span class="result-title">{{ res.name }}</span>
            <p>{{ res.description }}</p>
          </div>
        </div>
      </section>

      <hr class="section-divider" />

      <section class="analysis-section">
        <h4>Optimizations</h4>
        <div v-if="isLoadingOptimizations" class="loading-state">
          <span class="spinner"></span> Analyzing optimizations...
        </div>
        <div v-else-if="!optimizations.length" class="empty-state">No optimizations found.</div>
        <div v-else class="results-container">
          <div v-for="(res, idx) in optimizations" :key="'opt-'+idx" class="result-card danger">
            <span class="result-title">{{ res.name }}</span>
            <p>{{ res.description }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    depletions: { type: Array, default: () => [] },
    optimizations: { type: Array, default: () => [] },
    isLoadingDepletions: { type: Boolean, default: false },
    isLoadingOptimizations: { type: Boolean, default: false }
  },
  mounted() {
    console.log("ResultsScreen mounted with depletions:", this.depletions);
  },
}

</script>

<style scoped>
.results-screen {
  position: relative;

  .card-header {
    display: flex;
    position: sticky;
    top: 0;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: white;
    border-bottom: 1px solid #eee;
    z-index: 1000;

    h3 {
      margin: 0;
      color: #1b3a57;
      font-size: 16px;
    }

    .back-btn {
      background: none;
      border: none;
      color: #1b3a57;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  .card-body {
    padding: 15px;
    max-height: 400px;
    overflow-y: auto;

    .analysis-section {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 10px 0;
        color: #555;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .loading-state, .empty-state {
        padding: 15px;
        color: #888;
        font-size: 12px;
        text-align: center;
        font-style: italic;

        .spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid #ccc;
          border-top-color: #1b3a57;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      }
    }

    .results-container {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .result-card {
        padding: 10px;
        border-radius: 8px;
        border-left: 4px solid #ddd;
        font-size: 13px;

        &.danger {
          background: #fff5f5;
          border-left-color: #d32f2f;
          color: #b71c1c;
        }

        &.safe {
          background: #f1f8e9;
          border-left-color: #388e3c;
          color: #1b5e20;
        }

        .result-title {
          display: block;
          font-weight: bold;
          margin-bottom: 2px;
        }
      }
    }

    .section-divider {
      margin: 20px 0;
      border: 0;
      border-top: 1px solid #f0f0f0;
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>