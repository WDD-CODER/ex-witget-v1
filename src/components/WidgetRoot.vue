<template>
  <div class="afikasafe-wrapper">
    <div class="afikasafe-icon-trigger" :class="{ 'is-card-anchor': isExpanded }" @click="isExpanded = !isExpanded">
      <span class="leaf-icon">🍃</span>
    </div>

    <div v-if="isExpanded" class="afikasafe-widget-card">
      <SearchScreen v-if="contentMode === 'SearchScreen'" :selected-items="selectedItems"
        :loading="isLoadingDepletions || isLoadingOptimizations" @add-item="addItem" @remove-item="removeItem"
        @process-analysis="handleCheckInteractions" />

      <ResultsScreen v-else-if="contentMode === 'ResultsScreen'" :depletions="depletions" :optimizations="optimizations"
        :isLoadingDepletions="isLoadingDepletions" :isLoadingOptimizations="isLoadingOptimizations"
        @set-screen="setScreen" @set-selected-item="onSetSelectedItem" @set-drug-interaction="onSetDrugInteraction" />

      <MonographScreen v-else-if="contentMode === 'MonographScreen'" :selectedItemName="selectedItemName"
        @set-screen="setScreen" @set-label="setSelectedLabel" />

      <LabelScreen v-else-if="contentMode === 'LabelScreen'" :selectedLabelTitle="selectedLabelTitle"
        :selectedLabelData="selectedLabelData" @set-screen="setScreen" />


      <InteractionScreen v-else-if="contentMode === 'InteractionScreen'" :interactedDrugName="interactedDrugName"
        :mainDrugName="mainDrugName" @set-screen="setScreen" />
    </div>


  </div>
</template>

<script>
import SearchScreen from './SearchScreen.vue';
import ResultsScreen from './ResultsScreen.vue';
import InteractionScreen from './InteractionScreen.vue';
import MonographScreen from './MonographScreen.vue';
import LabelScreen from './LabelScreen.vue';

import { showErrorMsg } from '../services/event-bus.service';
import { DrugController } from '../services/drug.controller';

import "../assets/style/basic.css";

export default {
  name: 'WidgetRoot',
  components: { SearchScreen, ResultsScreen, MonographScreen, LabelScreen, InteractionScreen },
  props: {
    config: { type: Object, required: true }
  },
  data() {
    return {
      isExpanded: false,
      contentMode: 'SearchScreen',
      selectedItems: [],
      selectedItemName: '',
      selectedLabelTitle: '',
      selectedLabelData: '',
      mainDrugName: '',
      interactedDrugName: '',
      depletions: [],
      optimizations: [],
      isLoadingDepletions: false,
      isLoadingOptimizations: false
    };
  },
  mounted() {
    if (process.env.NODE_ENV === 'development') this.injectDevStyles();
  },
  updated() {
    if (process.env.NODE_ENV === 'development') this.injectDevStyles();
  },
  methods: {
    setSelectedLabel(data, title) {
      this.selectedLabelTitle = title
      this.selectedLabelData = data
    },
    onSetDrugInteraction(mainDrug, interactedDrug) {
      this.mainDrugName = mainDrug
      this.interactedDrugName = interactedDrug
    },
    onSetSelectedItem(DrugName) {
      console.log("🚀 ~ DrugName:", DrugName)
      this.selectedItemName = DrugName
    },
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
      if (this.selectedItems.length === 0) return;

      const itemNames = this.selectedItems.map(item => item.name);
      this.setScreen('ResultsScreen');

      this.isLoadingDepletions = true;
      this.isLoadingOptimizations = true;

      try {
        // 1. Get Depletions and update UI immediately
        this.depletions = await DrugController.getAnalysis(itemNames);
        this.isLoadingDepletions = false;

        // 2. Get Optimizations in the background and update UI when ready
        this.optimizations = await DrugController.loadOptimizations(itemNames);
        this.isLoadingOptimizations = false;

      } catch (err) {
        this.isLoadingDepletions = false;
        this.isLoadingOptimizations = false;
        showErrorMsg("Analysis failed.");
      }
    },
    injectDevStyles() {
      const shadowRoot = this.$el.parentNode;
      const regex = /data-v-/i;

      if (!shadowRoot || !shadowRoot.host) return;

      shadowRoot.querySelectorAll('style.cloned-dev-style').forEach(s => s.remove());

      const styles = document.querySelectorAll('style');
      styles.forEach(style => {
        const isWidgetStyle =
          style.textContent.includes('afikasafe') ||
          style.textContent.includes('search-screen') ||
          style.textContent.includes('results-screen') ||
          regex.test(style.textContent);

        if (isWidgetStyle) {
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
  z-index: 10000;

  align-items: flex-end;

  font-family: Arial, sans-serif;

  .afikasafe-icon-trigger {
    display: flex;
    position: relative;
    z-index: 2000;

    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;

    background: #ffffff;

    border: 2px solid #2e7d32;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

    cursor: pointer;

    &.is-card-anchor {
      position: absolute;
      right: -27px;
      bottom: -20px;

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

    background: #ffffff;

    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .loader {
      display: flex;

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #1b3a57;
      border-radius: 50%;

      animation: spin 0.8s linear infinite;
    }
  }
}

.monograph-screen {
  display: grid;
  position: relative;

  min-height: 200px;

  background: #f4f6f2;

  .monograph-header {
    display: flex;

    height: 30px;
    align-items: center;
    padding: 10px 5px;

    background: #e9ede4;
    z-index: 1000;

    .back-btn {
      display: flex;

      width: fit-content;

      background: none;

      color: #1b3a57;
      font-size: 20px;

      border: none;

      cursor: pointer;
    }

    h2 {
      margin: 0;

      color: #1b3a57;
      font-size: 22px;
      font-weight: 400;
      text-transform: uppercase;
    }
  }

  .monograph-body {
    position: relative;
    display: grid;
    padding: 15px;
    background-color: inherit;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>