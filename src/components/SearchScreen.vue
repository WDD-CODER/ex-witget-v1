<template>
  <div class="search-screen">
    <div class="card-header">
      <h3>Check Interactions</h3>
    </div>

    <div class="card-body">
      <div class="search-container">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            v-model="query" 
            placeholder="Search drugs or supplements..."
            @keyup.enter="handleManualAdd" 
          />
          <button class="add-btn" @click="handleManualAdd">Add</button>

          <ul v-if="suggestions.length" class="suggestions-list">
            <li v-for="item in suggestions" :key="item.name" @click="handleSuggestSelect(item)">
              <span class="suggest-icon">{{ item.icon }}</span>
              <span class="suggest-name">{{ item.name }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="items-list">
        <div v-for="(item, index) in selectedItems" :key="index" class="chip">
          <span class="chip-icon">{{ item.icon }}</span>
          <span class="chip-text">{{ item.name }}</span>
          <span class="remove-chip" @click="$emit('remove-item', index)">×</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <button 
        class="submit-btn" 
        :disabled="selectedItems.length === 0 || loading" 
        @click="$emit('process-analysis')"
      >
        {{ loading ? 'Processing...' : 'Check Interactions' }}
      </button>
    </div>
  </div>
</template>

<script>
import { drugBank } from '../assets/data/drugBank';

export default {
  props: ['selectedItems', 'loading'],
  data() {
    return {
      query: '',
      drugBank
    };
  },
  computed: {
    suggestions() {
      const q = this.query.toLowerCase().trim();
      if (q.length < 2) return [];
      return this.drugBank.filter(item => 
        item.name.toLowerCase().includes(q) && 
        !this.selectedItems.find(s => s.name === item.name)
      ).slice(0, 5);
    }
  },
  methods: {
    handleSuggestSelect(item) {
      this.$emit('add-item', { ...item });
      this.query = '';
    },
    handleManualAdd() {
      if (!this.query.trim()) return;
      this.$emit('add-item', { name: this.query.trim(), type: 'manual', icon: '💊' });
      this.query = '';
    }
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #eee;
  h3 { margin: 0; font-size: 16px; color: #1b3a57; }
}

.card-body {
  padding: 15px;
  min-height: 120px;

  .search-input-wrapper {
    display: flex;
    position: relative;
    width: 100%;

    input {
      width: 100%;
      padding: 10px 60px 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .add-btn {
      position: absolute;
      right: 5px;
      top: 5px;
      bottom: 5px;
      padding: 0 12px;
      background: #1b3a57;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .suggestions-list {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      list-style: none;
      padding: 0;
      margin: 4px 0;
      z-index: 2000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);

      li {
        display: flex;
        padding: 10px;
        cursor: pointer;
        &:hover { background: #f0f7f0; }
        .suggest-icon { margin-right: 8px; }
      }
    }
  }

  .items-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 15px;

    .chip {
      display: flex;
      align-items: center;
      padding: 4px 10px;
      background: #e8f5e9;
      border-radius: 16px;
      font-size: 13px;
      .chip-icon { margin-right: 6px; }
      .remove-chip { margin-left: 8px; cursor: pointer; }
    }
  }
}

.card-footer {
  padding: 15px;
  .submit-btn {
    width: 100%;
    padding: 12px;
    background: #1b3a57;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    &:disabled { background: #ccc; }
  }
}
</style>