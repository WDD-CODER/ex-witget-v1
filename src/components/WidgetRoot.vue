<template>
  <div class="afikasafe-wrapper">
    <div class="afikasafe-icon-trigger" :class="{ 'is-card-anchor': isExpanded }" @click="isExpanded = !isExpanded">
      <span class="leaf-icon">🍃</span>
    </div>

    <div v-if="isExpanded" class="afikasafe-widget-card">
   <component 
  :is="contentMode" 
  :config="config" 
  :selected-items="selectedItems" 
  :depletions="depletions"
  :optimizations="optimizations"
  :isLoadingDepletions="isLoadingDepletions"
  :isLoadingOptimizations="isLoadingOptimizations"
  :loading="loading" 
  @add-item="addItem" 
  @remove-item="removeItem" 
  @set-screen="setScreen"
  @process-analysis="handleCheckInteractions" 
/>
    </div>
  </div>
</template>

<script>
import SearchScreen from './SearchScreen.vue';
import ResultsScreen from './ResultsScreen.vue';
import { debounce } from '../directives/debounce';
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service';
import { DrugController } from '../services/drug.controller';

export default {
  name: 'WidgetRoot',
  components: { SearchScreen, ResultsScreen },
  props: {
    config: { type: Object, required: true }
  },
  data() {
    return {
      depletions: [],
      optimizations: [],
      isLoadingDepletions: false,
      isLoadingOptimizations: false,
      isExpanded: false,
      contentMode: 'SearchScreen',
      selectedItems: [],
      apiResults: null,
      loading: false
    };
  },
  directives: {
    debounce // Now available to all children of WidgetRoot
  },
  mounted() {
    if (process.env.NODE_ENV === 'development') this.injectDevStyles();
  },
  updated() {
    if (process.env.NODE_ENV === 'development') this.injectDevStyles();
  },
  methods: {
    setScreen(screenName) {
      this.contentMode = screenName;
    },
   addItem(item) {
    const exists = this.selectedItems.find(i => i.name === item.name);
    if (!exists) this.selectedItems.push(item);
},
    removeItem(index) {
      this.selectedItems.splice(index, 1);
    },
    async handleCheckInteractions() {
      console.log("🚀 ~ Analysis Started ~ items:", this.selectedItems.length);
      if (this.selectedItems.length === 0) return;

      // Convert objects to simple name array for the API
      const itemNames = this.selectedItems.map(item => item.name);

      this.isLoadingDepletions = true;
      this.isLoadingOptimizations = true;
      this.setScreen('ResultsScreen');

      try {
        // Progressive Loading: Depletions first
        this.depletions = await DrugController.getAnalysis(itemNames);
        this.isLoadingDepletions = false;

        // Background Loading: Optimizations second
        this.optimizations = await DrugController._loadOptimizations(itemNames);
        this.isLoadingOptimizations = false;
        showSuccessMsg('Analysis Worked!')
      } catch (err) {
        this.isLoadingDepletions = false;
        this.isLoadingOptimizations = false;
        showErrorMsg("Analysis failed.");
      }
    },
    injectDevStyles() {
      const shadowRoot = this.$el.parentNode;
      const regex = /data-v-/i

      if (!shadowRoot || !shadowRoot.host) return;

      // 1. Layout & Positioning: Clear previous cloned styles
      shadowRoot.querySelectorAll('style.cloned-dev-style').forEach(s => s.remove());

      const styles = document.querySelectorAll('style');
      styles.forEach(style => {
        // 2. Alignment & Spacing: Identify styles belonging to our widget or scoped components
        const isWidgetStyle = style.textContent.includes('afikasafe') ||
          regex.test(style.textContent);

        if (isWidgetStyle) {
          // 3. Dimensions & Aesthetics: Clone and append to Shadow Root
          const clone = style.cloneNode(true);
          clone.classList.add('cloned-dev-style');
          shadowRoot.appendChild(clone);
        }
      });
    }
  }
};
</script>

<style>
.afikasafe-wrapper {
  display: flex;
  position: fixed;
  flex-direction: column;
  top: 20px;
  left: 20px;
  align-items: flex-end;
  font-family: Arial, sans-serif;
  z-index: 10000;

  .afikasafe-icon-trigger {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: #fff;
    border: 2px solid #2e7d32;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 2000;

    &.is-card-anchor {
      position: absolute;
      bottom: -20px;
      right: -27px;
      width: 40px;
      height: 40px;
    }

    .leaf-icon {
      font-size: 24px;
    }
  }

  .afikasafe-widget-card {
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    width: 320px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    /* overflow: hidden; */
  }
}
</style>