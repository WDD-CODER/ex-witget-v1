<template>
  <div class="monograph-screen">
    <div class="monograph-header">
      <button class="back-btn" @click="$emit('set-screen', 'ResultsScreen')">
        <span class="arrow">←</span>
      </button>
      <span v-if="drugIcon && this.fromWere === 'fromSearch'" class="drug-icon">
        <img :src="drugIcon" :alt="drugIcon + ' icon'" />
      </span>
      <h2>{{ selectedItem.name }}</h2>
    </div>

    <div class="monograph-body">
      <div v-if="!!drugInfo" class="drug-info" :class="{ 'from-result': fromWere === 'fromResult' }">
        <div v-for="(value, title) in drugInfo" :key="title" class="drug-label" @click="setLabel(value, title)">
          <span class="title">{{ title }}</span>
          <span class="arrow">→</span>
        </div>
      </div>
      <div v-else class="loader">
        <span class="spinner"></span>
      </div>
    </div>
  </div>
</template>

<script>
import DrugService from '../services/drug.service';

export default {
  name: 'MonographScreen'
  ,
  props: {
    selectedItem: {
      type: Object,
      required: true
    },
    fromWere: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      drugInfo: null,
      drugIcon: null,
    }
  },
  methods: {
    mapMaterialInfo(raw) {
      const labels = {};

      // 1. Preserving HTML for Background
      const backgroundParts = [raw.desc, raw.dBankDesc].filter(v => v?.trim());
      if (backgroundParts.length > 0) {
        labels['Background'] = backgroundParts.join('<br><br>');
      }

      // 2. Preserving HTML for Medicinal uses
      const clinicalParts = [raw.medicinalUsesTxt, raw.dBankClinicalDesc].filter(v => v?.trim());
      if (clinicalParts.length > 0) {
        labels['Medicinal uses'] = clinicalParts.join('<br><br>');
      }

      // 3. Preserving HTML for Dosage (Updated)
      if (raw.shortDosage) {
        labels['Daily dosage'] = raw.shortDosage;
      }

      if (raw.dosage) {
        // Logic updated: No longer stripping HTML tags
        labels['Dosage'] = raw.dosage.trim();
      }

      // 4. Remaining Standard Labels (Text only)
      const standardFields = {
        'Active constituents': raw.activeConstituents,
        'Plant part used': raw.plantPartUsed,
        'Qualities': raw.qualities,
        'Precautions': raw.precautions,
        'Adverse reactions': raw.adverseReactions,
        'Toxicity': raw.toxicity,
        'Nutritional sources': raw.nutritionalSources,
        'Symptoms of deficiency': raw.symptomsOfDeficiency
      };

      Object.entries(standardFields).forEach(([label, value]) => {
        if (value && typeof value === 'string' && value.trim().length > 0) {
          labels[label] = value.trim();
        }
      });
      // Resolve SVG path dynamically so the bundler can see it
      const iconPath = raw.type === 'drug'
        ? new URL('../assets/img/pill-big.svg', import.meta.url).href
        : new URL('../assets/img/leaf.svg', import.meta.url).href;

      this.drugIcon = iconPath
      return labels
    },

    setLabel(data, title) {
      this.$emit('set-label', data, title)
      this.$emit('set-screen', 'LabelScreen')
    },
  },
  async mounted() {
    try {
      const drug = await DrugService.fetchDragByName(this.selectedItem.name);
      if (!drug) return
      this.drugInfo = this.mapMaterialInfo(drug)
    } catch (err) {
      console.error("Fetch failed", err);
    }
  }
}

</script>

<style scoped>
.monograph-screen {
  display: grid;
  grid-template-rows: auto 1fr;

  height: 100%;

  border-radius: 24px;

  .monograph-header {
    display: flex;
    align-items: center;
    gap: 5px;

    border-top-left-radius: 24px;
    border-top-right-radius: 24px;

    .drug-icon {
      display: flex;

      img {
        width: 23.76px;
        height: 21.1px;
      }
    }
  }

  .loader {
    display: flex;
    position: absolute;
    top: 50%;
    left: calc(50% - 13px);

    .spinner {
      width: 26px;
      height: 26px;

      border: 2px solid #f3f3f3;
      border-top: 2px solid #1b3a57;
      border-radius: 50%;

      animation: spin 0.8s linear infinite;
    }
  }

  .monograph-body {
    border-radius: inherit;

    .drug-info {
      display: grid;
      z-index: 1000;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-flow: dense;

      column-gap: 2px;

      p {
        margin: 0;
      }

      .drug-label {
        display: flex;
        align-items: center;
        height: fit-content;
        padding: 6px;

        background: #ffffff;
        color: #1b3a57;

        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

        cursor: pointer;
        transition: transform 0.1s ease;

        &:active {
          transform: scale(0.98);
        }

        .title {
          font-size: smaller;
        }

        .arrow {
          padding-inline-start: 2px;
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>