<template>
  <div class="afikasafe-wrapper">
    <div class="icon-wrapper" :class="{ 'is-card-anchor': isExpanded }">
      <div class="afikasafe-icon" @click="isExpanded = !isExpanded">
        <span class="leaf-icon"><img src="../assets/img/logo.png" alt="logo Image"></span>
      </div>
    </div>

    <div v-if="isExpanded" class="afikasafe-widget-card">
      <SearchScreen v-if="contentMode === 'SearchScreen'" :selected-items="selectedItems"
        :loading="isLoadingDepletions || isLoadingOptimizations" @add-item="addItem" @remove-item="removeItem"
        @process-analysis="handleCheckInteractions"   @set-screen="setScreen"  @set-selected-item="onSetSelectedItem"/>

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
  font-family: Roboto;


  .icon-wrapper {
    display: flex;
    position: relative;
    z-index: 2100;

    border: 3px solid transparent;
    border-radius: 50%;
    background-image: linear-gradient(#235775, #54C394),
      linear-gradient(90deg, #235775 0%, #54C394 98.4%);
    background-origin: border-box;
    background-clip: padding-box, border-box;

    box-shadow: 0 3px 3px 0 rgba(32, 80, 114, 0.4),
      inset 0 1px 2px 0 rgba(255, 255, 255, 0.25);

    &.is-card-anchor {
      position: absolute;
      right: -27px;
      bottom: -20px;

      .afikasafe-icon {
        width: 40px;
        height: 40px;

        img {
          width: 26.47px;
          height: 27.94px;
        }
      }
    }

    .afikasafe-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 60px;
      height: 62px;

      background-color: #F4F5F0;
      border: 1px solid #48C991;
      border-radius: 50%;
      box-shadow: 0px 2px 2px 0px #205072;
      cursor: pointer;

      img {
        width: 36px;
        height: 38px;
      }
    }
  }


  .afikasafe-widget-card {
    display: flex;
    flex-direction: column;

    margin-top: 10px;

    width: 340px;
    height: 326px;


    border: 3px solid transparent;
    background-image: linear-gradient(#fff, #fff),
      linear-gradient(90deg, #235775 0%, #54C394 98.4%);

    background-origin: border-box;
    background-clip: padding-box, border-box;

    border-radius: 24px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

     background-color: #F4F5F0;

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